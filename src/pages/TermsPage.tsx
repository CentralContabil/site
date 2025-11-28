import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="pt-28 pb-10 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Termos de Uso
          </h1>
          <p className="text-gray-600">
            Leia atentamente os termos abaixo antes de utilizar o site e os serviços da Central Contábil.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-gray-800">
          <div>
            <h2 className="text-xl font-semibold mb-2">1. Aceitação dos Termos</h2>
            <p className="leading-relaxed text-gray-700">
              Ao acessar e utilizar este site, você concorda com estes Termos de Uso e com nossa Política de
              Privacidade. Caso não concorde com alguma condição, recomendamos que não utilize o site.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">2. Uso do Conteúdo</h2>
            <p className="leading-relaxed text-gray-700">
              Todo o conteúdo disponibilizado neste site (textos, imagens, ilustrações e demais materiais)
              tem caráter informativo e institucional. É proibida a reprodução total ou parcial sem
              autorização prévia por escrito da Central Contábil.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">3. Informações e Atualizações</h2>
            <p className="leading-relaxed text-gray-700">
              As informações aqui apresentadas podem ser atualizadas a qualquer momento, sem aviso prévio,
              especialmente em função de alterações legais, tributárias ou regulatórias.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">4. Contato</h2>
            <p className="leading-relaxed text-gray-700">
              Em caso de dúvidas sobre estes Termos de Uso, entre em contato pelos canais disponíveis na
              seção de contato do site.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};




