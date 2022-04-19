import { useState, useEffect } from "react";
import Uppy from "@uppy/core";
import Transloadit from "@uppy/transloadit";

export default function Home() {
  const [uppy, setUppy] = useState();
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [imageUrl, setImageUrl] = useState(
    "https://pbs.twimg.com/media/EMnMjKkX0AAw1Pz.jpg"
  );

  // Esta funcion se ejecuta al terminar de subir el archivo
  const onCompleteUploadFiles = (assembly) => {
    const image = assembly.results?.compress_image[0].ssl_url; // tomamos la url de la imagen subida a s3

    setImageUrl(image); // guardamos la url de la imagen en el estado para poder usarla como y cuando queramos

    uppy.reset(); // limpiamos la instancia de uppy

    setIsUploadingFile(false); // cambiaos el estado para mostrar un mensaje diferente
  };

  const onFileInputChange = (event) => {
    setIsUploadingFile(true); // cambiamos el estado para reflejar que la carga del archivo a comenzado

    const file = Array.from(event.target.files)[0] || null; // tomamos el archivo del input

    if (file) {
      // agregamos manualmente el archivo a uppy
      uppy.addFile({
        name: file.name,
        type: file.type,
        data: file,
      });

      // iniciamos la carga del archivo
      uppy.upload();
    }
  };

  useEffect(() => {
    /**
     * Usamos este useEffect para solo cargar el dashboard de lado del cliente
     * Asi evitamos errores por intentar cargar de lado del server
     */
    const uppyInstance = new Uppy({
      restrictions: {
        maxNumberOfFiles: 1, // para que solo pueda subir una imagen a la vez
      },
    })
      .use(Transloadit, {
        params: {
          auth: { key: process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY }, // este valor esta en transloadit en credentials > AUTH KEY
          template_id: process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID, // este valor esta en templates > template > TEMPLATE ID
        },
        waitForEncoding: true, // necesario para que nos regrese la url del archivo
      })
      .on("transloadit:complete", onCompleteUploadFiles); // callback que se ejecuta al completar la subida a s3

    setUppy(uppyInstance);
  }, []);

  return (
    <>
      <h1>FileInput ( Uppy + Transloadit )</h1>
      <div className="container">
        <div className="plugin">
          <input
            type="file"
            name="file"
            id="file"
            onChange={onFileInputChange}
          />
          <p>{isUploadingFile ? "Cargando" : "👍"}</p>
        </div>
        <div className="image">
          <img src={imageUrl} alt="image" />
        </div>
      </div>
    </>
  );
}
