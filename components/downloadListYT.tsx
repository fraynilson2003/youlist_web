import { useEffect, useState } from "react";
import { Button } from "@nextui-org/button";
import { Form } from "@nextui-org/form";
import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";

const baseApi = process.env.NEXT_PUBLIC_API_URL;

export default function DownloadListYT() {
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    try {
      const newUrl = new URL(`${baseApi}/playlist/mp3`);

      newUrl.searchParams.append("url", value);
      setUrl(newUrl.toString());
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return;
    }
  }, [value]);

  const validateYouTubeUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);

      // Verificar que sea un dominio de YouTube
      if (
        !urlObj.hostname.includes("youtube.com") &&
        !urlObj.hostname.includes("youtu.be")
      ) {
        return false;
      }

      // Verificar si es una URL de lista de reproducción o contiene el parámetro list
      return (
        url.includes("list=") ||
        url.includes("playlist?list=") ||
        url.includes("&list=")
      );
    } catch {
      return false;
    }
  };

  const validateForm = (url: string): boolean => {
    if (!url.trim()) {
      setError("Por favor ingresa una URL de YouTube");

      return false;
    }

    if (!validateYouTubeUrl(url)) {
      setError(
        "La URL debe ser de YouTube y contener una lista de reproducción"
      );

      return false;
    }

    setError("");

    return true;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsTouched(true);

    if (!validateForm(value)) {
      return;
    }

    const handle = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(url, {
          method: "GET",
        });

        if (response.status === 401) {
          const data = await response.json();
          const url: string = data.url;

          window.location.href = url;
        }

        if (response.status === 200) {
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
          resetForm();
        }

        if (
          response.status >= 400 &&
          response.status <= 500 &&
          response.status !== 401
        ) {
          const data = await response.json();

          setError(data.message ?? "Ocurrio un error en la descarga.");
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Ocurrio un error en la descarga.");
        }
      } finally {
        setIsLoading(false);
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
          isDisabled={isLoading}
          labelPlacement="outside"
          name="url"
          placeholder="https://www.youtube.com/playlist?list=... o https://youtu.be/...?list=..."
          type="text"
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            setValue(newValue);
            if (isTouched) {
              validateForm(newValue);
            }
          }}
          onBlur={() => {
            setIsTouched(true);
            validateForm(value);
          }}
        />

        <Button
          isDisabled={!value || isLoading || !!error}
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
