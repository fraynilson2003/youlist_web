import { Button } from "@nextui-org/button";
import { Form } from "@nextui-org/form";
import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
import { useEffect, useState } from "react";

const baseApi = process.env.NEXT_PUBLIC_API_URL;

export default function DownloadListYT() {
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const newUrl = new URL(`${baseApi}/youtube/list/url`);

      newUrl.searchParams.append("url", value);
      setUrl(newUrl.toString());
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return;
    }
  }, [value]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const handle = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(url, {
          method: "GET",
        });

        if (!response.ok) {
          const data = await response.json();
          const messageError =
            data.message || "Error descargando la lista de reproducción";

          throw new Error(messageError);
        }

        let filename = "download.7z";
        const header = response.headers.get("Content-Disposition");

        if (header) {
          filename = header.split(/;(.+)/)[1].split(/=(.+)/)[1];
          if (filename.toLowerCase().startsWith("utf-8''"))
            filename = decodeURIComponent(filename.replace(/utf-8''/i, ""));
          else filename = filename.replace(/['"]/g, "");
        }

        const blob = await response.blob();

        const downloadUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = downloadUrl;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(downloadUrl);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Ocurrio un error en la descarga.");
        }
      } finally {
        resetForm();
      }
    };

    handle();
  };

  const resetForm = () => {
    setValue("");
    setUrl("");
    setIsLoading(false);
  };

  return (
    <Form
      className="w-full max-w-5xl mt-8 lg:mt-8"
      validationBehavior="native"
      onSubmit={onSubmit}
    >
      <div className="w-full flex  justify-center gap-2 items-center lg:gap-4">
        <Input
          errorMessage="Por favor ingresa un id o una url de una lista de YouTube"
          isDisabled={isLoading}
          labelPlacement="outside"
          name="url"
          placeholder="Ingresa una url de un video dentro de una lista de reproducción"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <Button
          isDisabled={!value || isLoading}
          type="submit"
          variant="bordered"
        >
          Descargar
        </Button>
      </div>

      <span className="h-10 text-base  text-red-500">{error}</span>

      <div className="text-small flex h-14  flex-col w-full bgre justify-center items-center gap-4 text-default-500 my-4">
        {isLoading && (
          <>
            <Spinner color="success" size="lg" />
            <span>
              Preparando el archivo para descargar, esto puede tomar algunos
              minutos.
            </span>
          </>
        )}
      </div>
    </Form>
  );
}
