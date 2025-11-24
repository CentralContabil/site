-- CreateTable
CREATE TABLE "hero" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "badge_text" TEXT NOT NULL DEFAULT 'Contabilidade Consultiva',
    "title_line1" TEXT NOT NULL DEFAULT 'Soluções que Vão',
    "title_line2" TEXT NOT NULL DEFAULT 'Além da Contabilidade',
    "description" TEXT NOT NULL DEFAULT 'Com mais de 34 anos de atuação, oferecemos consultoria contábil estratégica para impulsionar o crescimento do seu negócio com segurança e inovação.',
    "background_image_url" TEXT,
    "hero_image_url" TEXT,
    "button1_text" TEXT DEFAULT 'Agende uma Consultoria',
    "button1_link" TEXT DEFAULT '#contato',
    "button2_text" TEXT DEFAULT 'Conheça Nossos Serviços',
    "button2_link" TEXT DEFAULT '#servicos',
    "stat_years" TEXT DEFAULT '34+',
    "stat_clients" TEXT DEFAULT '500+',
    "stat_network" TEXT DEFAULT 'RNC',
    "updated_at" DATETIME NOT NULL
);
