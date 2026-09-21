/**
 * Plano de fundo trocável.
 *
 * Para usar imagem ou vídeo, coloque o arquivo em /public e defina no .env:
 *   VITE_BG_TYPE=video
 *   VITE_BG_SRC=/bg.mp4
 *
 * Os discos iridescentes continuam por cima do fundo escolhido.
 */

const BG_TYPE = import.meta.env.VITE_BG_TYPE ?? 'gradient'
const BG_SRC = import.meta.env.VITE_BG_SRC ?? ''

export default function Background() {
  return (
    <div className="bg" aria-hidden="true">
      {BG_TYPE === 'video' && BG_SRC && (
        <video
          className="bg-media"
          src={BG_SRC}
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      {BG_TYPE === 'image' && BG_SRC && (
        <img className="bg-media" src={BG_SRC} alt="" />
      )}

      {/* Véu escuro: garante contraste do texto sobre qualquer mídia. */}
      <div className="bg-veil" />

      {/* Discos iridescentes */}

    </div>
  )
}
