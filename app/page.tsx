import DownloadListYT from "@/components/downloadListYT";
import { title } from "@/components/primitives";

export default function Home() {
  return (
    <section className="flex h-full  flex-col items-center justify-center gap-4 py-8">
      <div className="inline-block text-center justify-center">
        <span className={title()}>Descarga&nbsp;</span>
        <br />
        <span className={title()}>listas de reproducción&nbsp;</span>
        <br />
        <span className={title({ color: "pink" })}>de YouTube&nbsp;</span>
      </div>

      <DownloadListYT />
    </section>
  );
}
