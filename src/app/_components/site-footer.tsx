export const CONTACT_EMAIL = "academiatabnit@gmail.com";

export function AboutSection() {
  return (
    <section aria-labelledby="quienes-somos" className="bg-white">
      <h2
        id="quienes-somos"
        className="bg-leaf px-4 py-4 text-center text-3xl font-semibold text-white sm:text-4xl"
      >
        ¿Quiénes somos?
      </h2>
      <p className="mx-auto max-w-2xl px-4 py-8 text-center font-medium sm:text-lg">
        “Somos una academia especializada en el aprendizaje e instrucción por medio del
        diseño gráfico, para potencializar todas las áreas de comunicaciones.”
      </p>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="flex flex-col items-center gap-1 bg-white px-4 py-12 text-center">
      <p className="text-xl sm:text-2xl">¿Alguna sugerencia? Contáctanos:</p>
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="font-semibold hover:text-brand hover:underline"
      >
        {CONTACT_EMAIL}
      </a>
    </footer>
  );
}
