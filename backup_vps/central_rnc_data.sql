--
-- PostgreSQL database dump
--

\restrict Wava0juYmJFAEo7J7000acgqdNlyOOVcIvP1EkFHgD3dzJ9DH92U6eyKdzE506F

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: forms; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.forms VALUES ('8e338aec-7571-4be4-be72-1d6cbe2dabf3', 'Formulario para teste', 'form-teste', '', true, '2025-12-04 19:53:32.348', '2025-12-04 19:53:32.348');


--
-- Data for Name: landing_pages; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.landing_pages VALUES ('a5ed9d79-ab86-4f63-8a42-a5b75e11618e', 'Landing Page', 'pagina-teste', '', 'Isto é um teste', 'Subtitulo', '', '', '<p>Bem vindo à landing page de teste. Preencha o formulario abaixo</p><p><br></p><p>[form slug="form-teste"]</p>', '/uploads/cc7500a7-1649-4b18-a948-264853fc89d5.png', '', '', '', true, true, '2025-12-04 20:41:31.671', '2025-12-04 20:41:31.673', '2025-12-04 20:41:31.673');


--
-- Data for Name: _FormToLandingPage; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--



--
-- Data for Name: access_logs; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.access_logs VALUES ('75e00f8b-0613-42b9-a9e0-93ecd2c546df', '12aab956-2db6-403c-977d-6dfab2be311b', 'wagner.guerra@gmail.com', 'Wagner Guerra', '187.64.128.254', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2fa', true, '2025-12-02 20:20:10.589');
INSERT INTO public.access_logs VALUES ('11a2fec0-cddc-460d-834f-43581cb54656', '12aab956-2db6-403c-977d-6dfab2be311b', 'wagner.guerra@gmail.com', 'Wagner Guerra', '187.64.128.254', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2fa', true, '2025-12-03 12:08:17.416');
INSERT INTO public.access_logs VALUES ('9bb1717c-c10a-4346-94e7-eaa73ab05788', '12aab956-2db6-403c-977d-6dfab2be311b', 'wagner.guerra@gmail.com', 'Wagner Guerra', '187.64.128.254', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2fa', true, '2025-12-03 12:47:54.217');
INSERT INTO public.access_logs VALUES ('b28e9500-b49f-48c4-8e26-8743cc9d657e', '12aab956-2db6-403c-977d-6dfab2be311b', 'wagner.guerra@gmail.com', 'Wagner Guerra', '187.64.128.254', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2fa', true, '2025-12-03 14:07:25.009');
INSERT INTO public.access_logs VALUES ('ee7cbb20-c151-4656-b87e-93202cb6250c', '12aab956-2db6-403c-977d-6dfab2be311b', 'wagner.guerra@gmail.com', 'Wagner Guerra', '187.64.128.254', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2fa', true, '2025-12-03 20:47:33.151');
INSERT INTO public.access_logs VALUES ('4382943a-e76b-48a0-99d0-c332fd929a79', '12aab956-2db6-403c-977d-6dfab2be311b', 'wagner.guerra@gmail.com', 'Wagner Guerra', '187.64.128.254', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2fa', true, '2025-12-05 14:00:31.744');
INSERT INTO public.access_logs VALUES ('90c86356-1f7b-4037-9e52-bc1d0a4de885', '12aab956-2db6-403c-977d-6dfab2be311b', 'wagner.guerra@gmail.com', 'Wagner Guerra', '187.64.128.254', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2fa', true, '2025-12-05 14:29:57.876');
INSERT INTO public.access_logs VALUES ('a142557e-431c-42a7-922f-0d415a1fdac0', '12aab956-2db6-403c-977d-6dfab2be311b', 'wagner.guerra@gmail.com', 'Wagner Guerra', '187.64.128.254', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2fa', true, '2025-12-05 18:30:41.527');


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.admins VALUES ('4a2a34d3-4ed0-4033-9d74-a5d45766395d', 'sistema@central-rnc.com.br', '$2b$10$ojy8/NBci9fymDCP8Xb5H.tuzr4OltMFDD6J1LriuQTweYZS7bmbS', 'Administrador Central RNC', 'administrator', '2025-12-02 17:41:53.832', '2025-12-02 17:41:53.832');
INSERT INTO public.admins VALUES ('12aab956-2db6-403c-977d-6dfab2be311b', 'wagner.guerra@gmail.com', '$2b$10$ojy8/NBci9fymDCP8Xb5H.tuzr4OltMFDD6J1LriuQTweYZS7bmbS', 'Wagner Guerra', 'administrator', '2025-12-02 17:41:53.838', '2025-12-02 17:41:53.838');
INSERT INTO public.admins VALUES ('f0dad6f4-d86b-4d34-9085-b0bab6a43b40', 'giovana@central-rnc.com.br', '2fa-only', 'Giovana Castiglioni', 'administrator', '2025-12-03 14:07:56.008', '2025-12-03 14:07:56.008');
INSERT INTO public.admins VALUES ('cfe3f831-297e-483b-be2c-ce648483e9df', 'ruth@central-rnc.com.br', '2fa-only', 'Ruthyellen Amparo', 'administrator', '2025-12-03 14:08:52.752', '2025-12-03 14:08:52.752');


--
-- Data for Name: auth_codes; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.auth_codes VALUES ('61fa7285-c5d5-488d-8f9b-f9af490cb0ee', 'wagner.guerra@gmail.com', '781442', 'email', true, '2025-12-02 20:29:56.243', '2025-12-02 20:19:56.25');
INSERT INTO public.auth_codes VALUES ('f0311c7d-5b17-497b-971f-caf22a1786f9', 'wagner.guerra@gmail.com', '248549', 'email', true, '2025-12-03 12:18:05.938', '2025-12-03 12:08:05.945');
INSERT INTO public.auth_codes VALUES ('aaaf1753-056c-4e52-9508-649af8a2cfc3', 'wagner.guerra@gmail.com', '376198', 'email', true, '2025-12-03 12:57:44.186', '2025-12-03 12:47:44.197');
INSERT INTO public.auth_codes VALUES ('13a39b14-5511-4507-a805-e6ca940cf406', 'wagner.guerra@gmail.com', '625165', 'email', true, '2025-12-03 14:17:10.667', '2025-12-03 14:07:10.675');
INSERT INTO public.auth_codes VALUES ('3218f0da-be43-4b7a-b622-8b7058d366a0', 'wagner.guerra@gmail.com', '398855', 'email', true, '2025-12-03 20:57:21.046', '2025-12-03 20:47:21.054');
INSERT INTO public.auth_codes VALUES ('23ce05cb-5f60-4c7c-b1a1-2e2a0824c91f', 'wagner.guerra@gmail.com', '440950', 'email', true, '2025-12-05 14:10:18.94', '2025-12-05 14:00:18.942');
INSERT INTO public.auth_codes VALUES ('038aa17e-1e2b-463b-9cd5-1c0c369d706a', 'wagner.guerra@gmail.com', '558043', 'email', true, '2025-12-05 14:39:40.605', '2025-12-05 14:29:40.618');
INSERT INTO public.auth_codes VALUES ('0fc5eff9-0f3e-441f-a0b7-52e8508dc72c', 'wagner.guerra@gmail.com', '958009', 'email', true, '2025-12-05 18:40:29.429', '2025-12-05 18:30:29.446');


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.blog_posts VALUES ('9eee6042-d8f4-4d38-a8ae-d440832568ad', 'Abertura de Empresa: Passo a Passo Completo', 'abertura-empresa-passo-passo-guia-completo', 'Planejando abrir uma empresa? Confira nosso guia completo com todos os passos necessários para abrir seu negócio de forma correta e sem complicações.', '<h2>Por Que Ter um Planejamento?</h2><p>Abrir uma empresa é um processo que envolve várias etapas e documentos. Ter um planejamento adequado evita retrabalho, economiza tempo e garante que tudo seja feito corretamente desde o início.</p><h2>Passo a Passo para Abertura</h2><h3>1. Definição do Tipo de Empresa</h3><p>Antes de tudo, é necessário definir o tipo societário:</p><ul><li><strong>MEI (Microempreendedor Individual):</strong> Para faturamento até R$ 81.000/ano</li><li><strong>EIRELI:</strong> Empresa Individual de Responsabilidade Limitada</li><li><strong>LTDA:</strong> Sociedade Limitada</li><li><strong>SA:</strong> Sociedade Anônima</li></ul><h3>2. Definição da Atividade</h3><p>É fundamental definir corretamente o CNAE (Código Nacional de Atividade Econômica) que melhor representa a atividade da empresa.</p><h3>3. Escolha do Nome</h3><p>Verificar a disponibilidade do nome empresarial junto à Junta Comercial ou Cartório de Registro de Pessoas Jurídicas.</p><h3>4. Definição do Regime Tributário</h3><p>Escolher entre Simples Nacional, Lucro Presumido ou Lucro Real, conforme a atividade e faturamento.</p><h3>5. Documentação Necessária</h3><ul><li>RG e CPF dos sócios</li><li>Comprovante de residência</li><li>Contrato social ou requerimento de empresário</li><li>Alvará de localização (quando necessário)</li></ul><h3>6. Registro na Junta Comercial</h3><p>Registro do contrato social ou requerimento de empresário na Junta Comercial do estado.</p><h3>7. Obtenção do CNPJ</h3><p>Cadastro na Receita Federal para obtenção do CNPJ.</p><h3>8. Inscrições Estaduais e Municipais</h3><ul><li>Inscrição Estadual (IE) para ICMS</li><li>Inscrição Municipal para ISS</li></ul><h3>9. Licenças e Alvarás</h3><p>Dependendo da atividade, podem ser necessários:</p><ul><li>Alvará de funcionamento</li><li>Licença sanitária</li><li>Licença ambiental</li><li>Outras licenças específicas</li></ul><h3>10. Abertura de Conta Bancária</h3><p>Com o CNPJ em mãos, é possível abrir conta corrente empresarial.</p><h2>Erros Comuns a Evitar</h2><ul><li>Escolher CNAE incorreto</li><li>Não definir corretamente o regime tributário</li><li>Esquecer de fazer inscrições necessárias</li><li>Não manter documentação organizada</li><li>Não contratar contador desde o início</li></ul><h2>Como a Central Contábil Pode Ajudar</h2><p>A Central Contábil oferece serviço completo de abertura de empresa, cuidando de todas as etapas do processo:</p><ul><li>Orientação sobre tipo societário e regime tributário</li><li>Elaboração de contrato social</li><li>Protocolo de todos os documentos</li><li>Acompanhamento de todo o processo</li><li>Orientação pós-abertura</li></ul><p>Abra sua empresa com quem entende do assunto! Entre em contato conosco.</p>', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=600&fit=crop', 'Equipe Central Contábil', true, '2024-04-01 00:00:00', '2025-11-21 14:12:49.338', '2025-11-24 21:53:20.013');
INSERT INTO public.blog_posts VALUES ('5ba31002-306a-4ab7-b547-96b05b2d9862', 'Compete-ES: Conheça os Benefícios Fiscais no Espírito Santo', 'compete-es-beneficios-fiscais-espirito-santo', 'O programa Compete-ES oferece incentivos fiscais significativos para empresas que investem no Espírito Santo. Saiba como sua empresa pode se beneficiar.', '<h2>O que é o Compete-ES?</h2><p>O Compete-ES (Programa de Competitividade do Espírito Santo) é uma iniciativa do governo estadual que oferece incentivos fiscais para empresas que investem no estado, visando promover o desenvolvimento econômico e a geração de empregos.</p><h2>Principais Benefícios</h2><ul><li><strong>Redução de ICMS:</strong> Até 75% de redução na alíquota de ICMS</li><li><strong>Crédito Presumido:</strong> Geração de créditos fiscais para compensação</li><li><strong>Isenção de Taxas:</strong> Dispensa de algumas taxas estaduais</li><li><strong>Desoneração:</strong> Redução da carga tributária em operações específicas</li></ul><h2>Quem Pode Participar?</h2><p>Empresas de diversos segmentos podem se beneficiar do Compete-ES:</p><ul><li>Indústrias</li><li>Comércio atacadista</li><li>E-commerce</li><li>Empresas de importação</li><li>Setor de serviços qualificados</li></ul><h2>Como Solicitar o Benefício</h2><p>O processo de habilitação ao Compete-ES envolve:</p><ol><li>Análise de elegibilidade da empresa</li><li>Preparação da documentação necessária</li><li>Protocolo junto à Secretaria de Estado da Fazenda (SEFAZ-ES)</li><li>Acompanhamento do processo de aprovação</li><li>Manutenção das obrigações para continuidade do benefício</li></ol><h2>Nossa Experiência</h2><p>A Central Contábil possui vasta experiência em processos de habilitação ao Compete-ES e outros programas de incentivos fiscais. Nossa equipe especializada pode orientar sua empresa em todo o processo, desde a análise de elegibilidade até a manutenção dos benefícios.</p><p>Entre em contato e descubra se sua empresa pode se beneficiar do Compete-ES!</p>', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop', 'Equipe Central Contábil', true, '2024-02-10 00:00:00', '2025-11-21 14:12:49.338', '2025-11-24 21:55:55.762');
INSERT INTO public.blog_posts VALUES ('d80aceb2-740f-4dd8-9628-87cfdd375c09', 'Planejamento Tributário 2024: Guia Completo para Empresas', 'planejamento-tributario-2024-guia-completo', 'Descubra como o planejamento tributário pode reduzir significativamente a carga fiscal da sua empresa em 2024. Estratégias legais e eficientes para otimizar seus impostos.', '<h2>O que é Planejamento Tributário?</h2><p>O planejamento tributário é uma ferramenta estratégica que permite às empresas reduzir legalmente a carga fiscal através da análise detalhada da legislação e da escolha do melhor regime tributário para cada situação.</p><h2>Benefícios do Planejamento Tributário</h2><ul><li><strong>Redução de custos:</strong> Economia significativa na carga tributária</li><li><strong>Conformidade legal:</strong> Garantia de estar em dia com todas as obrigações fiscais</li><li><strong>Competitividade:</strong> Preços mais competitivos no mercado</li><li><strong>Segurança:</strong> Evita autuações e multas fiscais</li></ul><h2>Principais Estratégias para 2024</h2><p>Em 2024, algumas estratégias se destacam:</p><ol><li><strong>Análise do regime tributário:</strong> Verificar se o Simples Nacional, Lucro Presumido ou Lucro Real é mais vantajoso</li><li><strong>Aproveitamento de incentivos fiscais:</strong> Como o Compete-ES e outros programas estaduais</li><li><strong>Otimização de despesas:</strong> Identificar despesas dedutíveis que podem reduzir a base de cálculo</li><li><strong>Planejamento de operações:</strong> Estruturar operações de forma mais eficiente fiscalmente</li></ol><h2>Como a Central Contábil Pode Ajudar</h2><p>Nossa equipe especializada em planejamento tributário está preparada para analisar sua empresa e desenvolver estratégias personalizadas que se adequem ao seu perfil e objetivos. Com mais de 34 anos de experiência, já ajudamos centenas de empresas a otimizar sua carga tributária.</p><p>Entre em contato conosco e descubra como podemos ajudar sua empresa a economizar com planejamento tributário estratégico.</p>', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop', 'Equipe Central Contábil', true, '2024-01-15 00:00:00', '2025-11-21 14:12:49.338', '2025-11-24 21:55:44.9');
INSERT INTO public.blog_posts VALUES ('4e9bc311-1993-4d41-bf3f-6d4aaab75c63', 'eSocial: Entenda o que é e Como Funciona', 'esocial-entenda-o-que-e-e-como-funciona', 'O eSocial é uma plataforma do governo que unifica o envio de informações trabalhistas, previdenciárias e fiscais. Saiba como funciona e como sua empresa deve se adequar.', '<h2>O que é o eSocial?</h2><p>O eSocial é um sistema eletrônico do governo federal que unifica o envio de informações trabalhistas, previdenciárias e fiscais das empresas. Foi criado para simplificar e padronizar a comunicação entre empregadores e órgãos públicos.</p><h2>Objetivos do eSocial</h2><ul><li>Reduzir a burocracia</li><li>Eliminar a duplicidade de informações</li><li>Facilitar a fiscalização</li><li>Melhorar a qualidade dos dados</li><li>Agilizar processos</li></ul><h2>Quem Deve Usar?</h2><p>Todas as empresas que possuem funcionários registrados devem utilizar o eSocial, incluindo:</p><ul><li>Empresas de todos os portes</li><li>MEI com funcionários</li><li>Órgãos públicos</li><li>Empregadores domésticos</li></ul><h2>Eventos do eSocial</h2><p>O sistema contempla diversos eventos, como:</p><ul><li><strong>S-1000:</strong> Informações do empregador</li><li><strong>S-1005:</strong> Tabelas de estabelecimentos</li><li><strong>S-1010:</strong> Rubricas</li><li><strong>S-2200:</strong> Cadastramento inicial do vínculo</li><li><strong>S-1200:</strong> Remuneração de trabalhador vinculado ao Regime Geral de Previdência Social</li><li><strong>S-2299:</strong> Desligamento</li><li>E muitos outros eventos específicos</li></ul><h2>Prazos e Obrigações</h2><p>Os prazos variam conforme o tipo de evento:</p><ul><li>Eventos de cadastro: até o dia 7 do mês seguinte</li><li>Eventos de folha: até o dia 7 do mês seguinte</li><li>Eventos não periódicos: conforme ocorrência</li></ul><h2>Consequências do Não Cumprimento</h2><ul><li>Multas por atraso ou omissão</li><li>Bloqueio de CNPJ</li><li>Impedimento de participar de licitações</li><li>Dificuldades para obter empréstimos</li></ul><h2>Como a Central Contábil Pode Ajudar</h2><p>Nossa equipe especializada em eSocial oferece:</p><ul><li>Cadastro inicial no sistema</li><li>Envio de todos os eventos necessários</li><li>Acompanhamento de prazos</li><li>Correção de inconsistências</li><li>Treinamento para sua equipe</li><li>Suporte contínuo</li></ul><p>Mantenha sua empresa em conformidade com o eSocial! Entre em contato conosco.</p>', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop', 'Equipe Central Contábil', true, '2024-04-15 00:00:00', '2025-11-21 14:12:49.338', '2025-11-26 20:24:29.81');
INSERT INTO public.blog_posts VALUES ('10d04743-6c78-4d0c-91d9-5221ffc543dc', 'Obrigações Fiscais Mensais: Guia Completo para Empresas', 'obrigacoes-fiscais-mensais-empresas-brasil', 'Mantenha sua empresa em dia com todas as obrigações fiscais mensais. Confira o calendário completo e evite multas e autuações.', '<h2>Importância das Obrigações Fiscais</h2><p>O cumprimento das obrigações fiscais é fundamental para manter a empresa em conformidade com a legislação e evitar multas, juros e outras penalidades que podem comprometer a saúde financeira do negócio.</p><h2>Principais Obrigações Mensais</h2><h3>1. Impostos Federais</h3><ul><li><strong>IRPJ e CSLL:</strong> Imposto de Renda e Contribuição Social sobre o Lucro Líquido</li><li><strong>PIS e COFINS:</strong> Contribuições sociais sobre o faturamento</li><li><strong>IRRF:</strong> Imposto de Renda Retido na Fonte</li><li><strong>INSS:</strong> Contribuições previdenciárias</li></ul><h3>2. Impostos Estaduais</h3><ul><li><strong>ICMS:</strong> Imposto sobre Circulação de Mercadorias e Serviços</li><li><strong>GIA:</strong> Guia de Informação e Apuração do ICMS</li></ul><h3>3. Impostos Municipais</h3><ul><li><strong>ISS:</strong> Imposto Sobre Serviços</li><li><strong>IPTU:</strong> Imposto sobre Propriedade Predial e Territorial Urbana (quando aplicável)</li></ul><h3>4. Obrigações Trabalhistas</h3><ul><li><strong>Folha de Pagamento:</strong> Cálculo e recolhimento de encargos</li><li><strong>eSocial:</strong> Envio de informações trabalhistas</li><li><strong>FGTS:</strong> Depósito mensal</li><li><strong>RAIS:</strong> Relação Anual de Informações Sociais (anual, mas com preparação mensal)</li></ul><h2>Calendário de Vencimentos</h2><p>Os vencimentos variam conforme o regime tributário e o porte da empresa. É importante manter um calendário atualizado para não perder prazos.</p><h2>Consequências do Atraso</h2><ul><li>Multas e juros sobre valores em atraso</li><li>Bloqueio de CNPJ</li><li>Impedimento de participar de licitações</li><li>Dificuldades para obter empréstimos</li><li>Possibilidade de enquadramento como empresa inidônea</li></ul><h2>Como a Central Contábil Pode Ajudar</h2><p>Nossa equipe especializada cuida de todas as obrigações fiscais da sua empresa, garantindo que tudo seja feito dentro dos prazos e em conformidade com a legislação. Oferecemos:</p><ul><li>Planejamento de obrigações mensais</li><li>Cálculo e recolhimento de impostos</li><li>Envio de declarações e guias</li><li>Acompanhamento de prazos</li><li>Alertas preventivos</li></ul><p>Deixe sua empresa em dia com a contabilidade! Entre em contato conosco.</p>', 'https://images.unsplash.com/photo-1554224155-6726b468ff31?w=1200&h=600&fit=crop', 'Equipe Central Contábil', true, '2024-03-20 00:00:00', '2025-11-21 14:12:49.338', '2025-11-24 21:55:38.321');
INSERT INTO public.blog_posts VALUES ('9bb32933-cbc0-4e26-963e-188ac347c463', 'Simples Nacional vs Lucro Presumido: Qual Escolher?', 'simples-nacional-vs-lucro-presumido-qual-escolher', 'A escolha do regime tributário é fundamental para a saúde financeira da sua empresa. Entenda as diferenças entre Simples Nacional e Lucro Presumido.', '<h2>Entendendo os Regimes Tributários</h2><p>A escolha do regime tributário adequado é uma das decisões mais importantes para uma empresa, pois impacta diretamente na carga tributária e na complexidade das obrigações fiscais.</p><h2>Simples Nacional</h2><h3>Vantagens:</h3><ul><li>Unificação de impostos em uma única guia (DAS)</li><li>Alíquotas progressivas conforme o faturamento</li><li>Menor burocracia e obrigações acessórias</li><li>Ideal para pequenas empresas</li></ul><h3>Desvantagens:</h3><ul><li>Limite de faturamento anual (R$ 4,8 milhões em 2024)</li><li>Algumas atividades não podem optar</li><li>Restrições para empresas com sócios no exterior</li></ul><h2>Lucro Presumido</h2><h3>Vantagens:</h3><ul><li>Sem limite de faturamento</li><li>Alíquotas fixas sobre a receita bruta</li><li>Mais flexibilidade para diferentes tipos de empresa</li><li>Possibilidade de reduzir a base de cálculo com despesas</li></ul><h3>Desvantagens:</h3><ul><li>Mais obrigações acessórias</li><li>Múltiplas guias de impostos</li><li>Maior complexidade na apuração</li><li>Pode ser mais oneroso para empresas com margem baixa</li></ul><h2>Como Escolher?</h2><p>A escolha deve ser baseada em:</p><ol><li><strong>Faturamento:</strong> Verificar se está dentro do limite do Simples</li><li><strong>Atividade:</strong> Confirmar se a atividade permite optar pelo Simples</li><li><strong>Margem de lucro:</strong> Analisar qual regime é mais vantajoso</li><li><strong>Estrutura:</strong> Considerar a capacidade de cumprir obrigações</li><li><strong>Projeções:</strong> Avaliar o crescimento esperado</li></ol><h2>Análise Personalizada</h2><p>Cada empresa é única e a escolha do regime tributário deve ser feita com base em uma análise detalhada. A Central Contábil oferece consultoria especializada para ajudar sua empresa a escolher o regime mais adequado, considerando todas as variáveis e projeções futuras.</p><p>Entre em contato e agende uma consultoria tributária personalizada!</p>', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop', 'Equipe Central Contábil', true, '2024-03-05 00:00:00', '2025-11-21 14:12:49.338', '2025-11-24 21:56:03.841');


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.categories VALUES ('de32b60f-32fc-473b-99af-d25ed352fdd4', 'Área Fiscal', 'rea-fiscal', 'Categoria para posts relacionados à área fiscal.', '#ff1900', true, '2025-12-05 18:34:20.865', '2025-12-05 18:34:20.865');
INSERT INTO public.categories VALUES ('12f99c77-5429-4ca4-b3cc-50333c9792fa', 'Área Trabalhista', 'rea-trabalhista', 'Categoria para posts relacionados à área trabalhista.', '#3bb664', true, '2025-12-05 18:34:36.49', '2025-12-05 18:34:50.882');
INSERT INTO public.categories VALUES ('ee4f1afa-f8c0-4a50-8c0f-0da9b552dc6c', 'Área Contábil', 'rea-contbil', 'Categoria para posts relacionados à área contábil.', '#8280ff', true, '2025-12-05 18:35:09.317', '2025-12-05 18:35:09.317');


--
-- Data for Name: blog_post_categories; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--



--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--



--
-- Data for Name: blog_post_tags; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--



--
-- Data for Name: careers_page; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.careers_page VALUES ('d3e67f2d-b4be-4edc-bb01-de457c8e8b7f', '/uploads/careers-page-1764763187627-149306911.png', 'Trabalhe Conosco', 'Estamos sempre em busca de profissionais que queiram crescer junto com a Central Contábil e com os nossos clientes.', 'Cultura e propósito', 'A Central Contábil tem mais de três décadas de história construídas com transparência, confiança e foco em resultados. Valorizamos um ambiente colaborativo, com desenvolvimento contínuo e visão de longo prazo para nossa equipe e nossos clientes.', 'Vagas em aberto', 'Neste momento não há vagas publicadas, mas estamos sempre avaliando novos talentos. Preencha o formulário abaixo e envie seu currículo para nossa equipe.', 'Benefícios', 'Ambiente estruturado e colaborativo
Exposição a diferentes segmentos de clientes
Desenvolvimento contínuo em contabilidade, fiscal e tributário', 'Perfil que buscamos', 'Compromisso com qualidade e prazos
Vontade de aprender e crescer
Boa comunicação e trabalho em equipe', '2025-12-03 11:59:14.354', '2025-12-03 12:00:12.953');
INSERT INTO public.careers_page VALUES ('4aa43a51-0fc3-456e-bcef-40a554d735cc', '/uploads/careers-page-1764244686791-733283636.png', 'Trabalhe Conosco', 'Estamos sempre em busca de profissionais que queiram crescer junto com a Central Contábil e com os nossos clientes.', 'Cultura e propósito', 'A Central Contábil tem mais de três décadas de história construídas com transparência, confiança e foco em resultados. Valorizamos um ambiente colaborativo, com desenvolvimento contínuo e visão de longo prazo para nossa equipe e nossos clientes.', 'Vagas em aberto', 'Neste momento não há vagas publicadas, mas estamos sempre avaliando novos talentos. Preencha o formulário abaixo e envie seu currículo para nossa equipe.', 'Benefícios', 'Ambiente estruturado e colaborativo
Exposição a diferentes segmentos de clientes
Desenvolvimento contínuo em contabilidade, fiscal e tributário', 'Perfil que buscamos', 'Compromisso com qualidade e prazos
Vontade de aprender e crescer
Boa comunicação e trabalho em equipe', '2025-11-27 11:57:58.442', '2025-11-27 12:04:56.054');


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.clients VALUES ('124acb30-f0b4-48cb-b039-3e82b28cce3d', 'Bluevix', '/uploads/b74b109f-99cf-47f5-9bdd-87832c587ad4.png', 'https://bluevix.com.br', NULL, 'https://instagram.com/techsolutions', 'https://linkedin.com/company/techsolutions', NULL, 1, true, '2025-11-24 12:37:33.365', '2025-11-24 18:11:49.917');
INSERT INTO public.clients VALUES ('ef7a0b0d-1e32-468b-84d1-1dff9a7a1fd3', 'Ótima Atacado', '/uploads/7adde803-fc35-47a4-bec3-0ecbd37d6f7f.png', 'https://www.otimaatacado.com.br', NULL, NULL, NULL, NULL, 2, true, '2025-11-24 12:37:33.372', '2025-11-24 18:04:33.212');
INSERT INTO public.clients VALUES ('14d3ea71-9e60-4dc0-a971-fc4345f68459', 'Darwin', '/uploads/0e7e85a4-3302-4f49-b956-2248e69553db.png', 'https://www.darwin.com.br', NULL, NULL, NULL, NULL, 3, true, '2025-11-24 12:37:33.377', '2025-11-24 18:11:59.192');
INSERT INTO public.clients VALUES ('c056adf0-2cb8-40ce-8800-cc846fdaf7ea', 'Wizard', '/uploads/a06e2d40-2e25-4443-a23d-a106bcf7deb8.png', 'https://grupowizard.com.br', NULL, NULL, NULL, NULL, 4, true, '2025-11-24 12:37:33.383', '2025-11-24 18:12:05.91');


--
-- Data for Name: configurations; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.configurations VALUES ('93409f44-6764-4565-866d-5435dce71d7b', 'Central Contábil', '(27) 2104-8300', 'contato@central-rnc.com.br', 'wagner.guerra@gmail.com', 'Avenida Central, n° 1345, Parque Residencial Laranjeiras, Serra/ES. CEP: 29165-130', 'Segunda a quinta-feira: 8h às 18h - Sexta-feira: 8h às 17h', NULL, NULL, NULL, '/uploads/4182d6ad-d307-431f-9857-357aad824aab.png', '/uploads/dc58144b-5659-4917-9092-38071c1908af.png', '/uploads/9d759583-2037-44db-9403-7c311f2aed9b.png', '(27) 99605-0879', 'Mais de 36 anos oferecendo soluções contábeis estratégicas para empresas que buscam crescimento sustentável.', '2025-11-21 14:11:37.508');
INSERT INTO public.configurations VALUES ('fdc411cb-13ea-4d11-9a5b-e1accb73b05e', 'Central Contábil', NULL, NULL, 'wagner.guerra@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mais de 34 anos oferecendo soluções contábeis estratégicas para empresas que buscam crescimento sustentável.', '2025-11-21 14:11:37.517');
INSERT INTO public.configurations VALUES ('default', 'Central Contábil', '(27) 2104-8300', 'contato@central-rnc.com.br', 'wagner.guerra@gmail.com', 'Avenida Central, n° 1345, Parque Residencial Laranjeiras, Serra/ES. CEP: 29165-130', 'Segunda a Quinta-feira: 8h às 18h | Sexta-feira: 8h às 17h', 'https://facebook.com/centralcontabil', 'https://instagram.com/centralcontabil', 'https://linkedin.com/company/centralcontabil', NULL, NULL, NULL, NULL, 'Mais de 34 anos oferecendo soluções contábeis estratégicas para empresas que buscam crescimento sustentável.', '2025-11-21 14:12:49.17');


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--



--
-- Data for Name: contact_message_replies; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--



--
-- Data for Name: form_fields; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.form_fields VALUES ('c686a0f5-36d4-4569-8392-60499a1c1331', NULL, '8e338aec-7571-4be4-be72-1d6cbe2dabf3', 'text', 'email', 'Seu E-mail', NULL, NULL, true, NULL, NULL, 0, true, '2025-12-05 13:39:14.948', '2025-12-05 13:39:14.948');


--
-- Data for Name: form_submissions; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--



--
-- Data for Name: hero; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.hero VALUES ('bd8da421-23b8-4aad-9bcd-8ad1b4b4bf6c', 'Contabilidade Consultiva', 'Soluções que vão', 'além da contabilidade', 'Com mais de 36 anos de atuação, oferecemos consultoria contábil estratégica para impulsionar o crescimento do seu negócio com segurança e inovação.', '/uploads/a043bcd0-4de2-46bf-be42-a4750a252a36.png', '/uploads/fbe4c3ec-23be-4564-91e3-2881c3bfbbf4.jpg', 'Agende uma Consultoria', '#contato', 'Conheça Nossos Serviços', '#servicos', '34+', '500+', 'RNC', 'Anos', '36+', 'Clientes', '500+', 'Associado', 'RNC', '2025-12-03 14:10:46.753');
INSERT INTO public.hero VALUES ('hero-1', 'CONTABILIDADE CONSULTIVA', 'Soluções que Vão', 'Além da Contabilidade', 'Com mais de 36 anos de atuação, oferecemos consultoria contábil estratégica para impulsionar o crescimento do seu negócio com segurança e inovação.', NULL, NULL, 'Agende uma Consultoria', '#contato', 'Conheça Nossos Serviços', '#servicos', '36+', '500+', 'RNC', 'Anos', '36+', 'Clientes', '500+', 'Associado', 'RNC', '2025-12-03 20:30:15.948');
INSERT INTO public.hero VALUES ('88952292-0afe-4e5c-91d1-e7d94695a184', 'Contabilidade Consultiva', 'Soluções que vão', 'além da contabilidade', 'Com mais de 36 anos de atuação, oferecemos consultoria contábil estratégica para impulsionar o crescimento do seu negócio com segurança e inovação.', '/uploads/1a4b99c1-f25b-418e-b39f-0eeaabad5214.png', '/uploads/96e5f59f-9ea3-4a06-a19b-6b709cda4ffd.jpg', 'Agende uma Consultoria', '#contato', 'Conheça Nossos Serviços', '#servicos', '36+', '500+', 'RNC', 'Anos', '36+', 'Clientes', '500+', 'Associado', 'RNC', '2025-12-03 12:02:08.67');


--
-- Data for Name: job_positions; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.job_positions VALUES ('41741df7-9be3-4726-8925-4dcdf6dcd565', 'Contador', 'Profissional responsável pela contabilidade geral, escrituração fiscal e tributária, elaboração de demonstrações contábeis e assessoria contábil.', true, 1, '2025-12-04 12:07:41.608', '2025-12-04 12:07:41.608');
INSERT INTO public.job_positions VALUES ('ffee0275-e1cb-469a-9964-182bd7b777ae', 'Analista Contábil', 'Análise de lançamentos contábeis, conciliações bancárias, controle de contas a pagar e receber, e apoio na elaboração de relatórios contábeis.', true, 2, '2025-12-04 12:07:41.676', '2025-12-04 12:07:41.676');
INSERT INTO public.job_positions VALUES ('044865fe-ec3b-4701-a7a9-42be03fd5a51', 'Analista Fiscal', 'Responsável pelo cálculo e apuração de impostos, elaboração de obrigações acessórias (SPED, EFD, DCTF), planejamento tributário e análise de legislação fiscal.', true, 3, '2025-12-04 12:07:41.713', '2025-12-04 12:07:41.713');
INSERT INTO public.job_positions VALUES ('00a08a0e-2b49-4e57-b1db-228b61c6c96b', 'Assistente Contábil', 'Apoio nas rotinas contábeis, organização de documentos, digitação de lançamentos, arquivamento e controle de prazos.', true, 4, '2025-12-04 12:07:41.754', '2025-12-04 12:07:41.754');
INSERT INTO public.job_positions VALUES ('1a1f86e4-99d9-43e0-b88e-c11e1229ce07', 'Assistente Fiscal', 'Auxílio nas rotinas fiscais, organização de documentos fiscais, controle de prazos de obrigações acessórias e apoio na apuração de impostos.', true, 5, '2025-12-04 12:07:41.792', '2025-12-04 12:07:41.792');
INSERT INTO public.job_positions VALUES ('36758add-e30a-444c-8662-400ccdf02812', 'Departamento Pessoal', 'Responsável pelo processamento de folha de pagamento, cálculo de encargos sociais, controle de férias, 13º salário, admissões e demissões.', true, 6, '2025-12-04 12:07:41.828', '2025-12-04 12:07:41.828');
INSERT INTO public.job_positions VALUES ('6c7a5920-7c8d-4df4-a354-f1d27c1cbec6', 'Analista de Departamento Pessoal', 'Análise e processamento de folha de pagamento, cálculo de provisões, controle de benefícios, e-Social e relacionamento com funcionários.', true, 7, '2025-12-04 12:07:41.871', '2025-12-04 12:07:41.871');
INSERT INTO public.job_positions VALUES ('2c30390c-7ce2-4d1f-8a5a-e0b06994bcd6', 'Assistente de Departamento Pessoal', 'Apoio nas rotinas de departamento pessoal, organização de documentos, controle de ponto, férias e benefícios.', true, 8, '2025-12-04 12:07:41.909', '2025-12-04 12:07:41.909');
INSERT INTO public.job_positions VALUES ('ecbd8e3a-3074-48a0-8814-5bbf0ac1674b', 'Auxiliar Contábil', 'Auxílio nas rotinas contábeis básicas, organização de documentos, arquivamento e apoio geral ao setor contábil.', true, 9, '2025-12-04 12:07:41.944', '2025-12-04 12:07:41.944');
INSERT INTO public.job_positions VALUES ('3a227e9e-657f-472f-ab27-d2d9ffc6e996', 'Auxiliar Fiscal', 'Auxílio nas rotinas fiscais básicas, organização de documentos fiscais, controle de prazos e apoio geral ao setor fiscal.', true, 10, '2025-12-04 12:07:41.981', '2025-12-04 12:07:41.981');
INSERT INTO public.job_positions VALUES ('fc7dc863-6564-42e2-aaa7-bce29dc2a356', 'Estagiário Contábil', 'Estágio na área contábil com aprendizado prático em escrituração, lançamentos contábeis e rotinas administrativas.', true, 11, '2025-12-04 12:07:42.012', '2025-12-04 12:07:42.012');
INSERT INTO public.job_positions VALUES ('d44f3b9c-af07-4787-8900-e43dc140dfb3', 'Estagiário Fiscal', 'Estágio na área fiscal com aprendizado prático em apuração de impostos, obrigações acessórias e rotinas fiscais.', true, 12, '2025-12-04 12:07:42.052', '2025-12-04 12:07:42.052');
INSERT INTO public.job_positions VALUES ('9c97e8a7-66ef-4168-bdf9-e0186a94457f', 'Estagiário Departamento Pessoal', 'Estágio na área de departamento pessoal com aprendizado prático em folha de pagamento, e-Social e rotinas de RH.', true, 13, '2025-12-04 12:07:42.088', '2025-12-04 12:07:42.088');
INSERT INTO public.job_positions VALUES ('22d4e3b1-8d9a-46c9-b675-8d1cf77357d8', 'Coordenador Contábil', 'Coordenação da equipe contábil, supervisão de processos, análise de demonstrações contábeis e relacionamento com clientes.', true, 14, '2025-12-04 12:07:42.123', '2025-12-04 12:07:42.123');
INSERT INTO public.job_positions VALUES ('fc75a6b6-76cb-4c74-8920-872ac578aee6', 'Coordenador Fiscal', 'Coordenação da equipe fiscal, supervisão de processos tributários, planejamento fiscal estratégico e relacionamento com clientes.', true, 15, '2025-12-04 12:07:42.162', '2025-12-04 12:07:42.162');
INSERT INTO public.job_positions VALUES ('aa7500ea-aee2-4858-95ad-c703cc39df57', 'Supervisor Contábil', 'Supervisão de equipe contábil, revisão de trabalhos, garantia de qualidade dos processos e treinamento de colaboradores.', true, 16, '2025-12-04 12:07:42.198', '2025-12-04 12:07:42.198');
INSERT INTO public.job_positions VALUES ('39a95445-1331-44cb-9d75-f5da76b49812', 'Supervisor Fiscal', 'Supervisão de equipe fiscal, revisão de apurações tributárias, garantia de conformidade fiscal e treinamento de colaboradores.', true, 17, '2025-12-04 12:07:42.236', '2025-12-04 12:07:42.236');
INSERT INTO public.job_positions VALUES ('39d240b7-8cf7-41ed-a748-d861da1beff2', 'Gerente Contábil', 'Gestão completa do setor contábil, estratégias de melhoria de processos, relacionamento com clientes de grande porte e liderança de equipe.', true, 18, '2025-12-04 12:07:42.271', '2025-12-04 12:07:42.271');
INSERT INTO public.job_positions VALUES ('1bfd16e6-f220-4f73-b9db-86f1f552b54d', 'Gerente Fiscal', 'Gestão completa do setor fiscal, planejamento tributário estratégico, relacionamento com clientes de grande porte e liderança de equipe.', true, 19, '2025-12-04 12:07:42.306', '2025-12-04 12:07:42.306');
INSERT INTO public.job_positions VALUES ('dff3cb80-98ee-44a7-8e97-b218824be6ed', 'Auditor Contábil', 'Realização de auditorias contábeis, análise de controles internos, verificação de conformidade e elaboração de relatórios de auditoria.', true, 20, '2025-12-04 12:07:42.344', '2025-12-04 12:07:42.344');
INSERT INTO public.job_positions VALUES ('4d1c1f6b-5700-409f-bfbf-bc0d384baf30', 'Consultor Contábil', 'Consultoria contábil estratégica, análise de processos, implementação de melhorias e assessoria especializada para clientes.', true, 21, '2025-12-04 12:07:42.383', '2025-12-04 12:07:42.383');
INSERT INTO public.job_positions VALUES ('c8c1397f-df8b-41cd-b82f-5f26ca3a7154', 'Consultor Fiscal', 'Consultoria fiscal estratégica, planejamento tributário, análise de oportunidades fiscais e assessoria especializada para clientes.', true, 22, '2025-12-04 12:07:42.417', '2025-12-04 12:07:42.417');
INSERT INTO public.job_positions VALUES ('94e98eab-3c15-4dbf-9b08-1cfe1236e2ef', 'Analista Contábil', 'Análise de lançamentos contábeis, conciliações bancárias, controle de contas a pagar e receber, e apoio na elaboração de relatórios contábeis.', true, 2, '2025-12-03 15:36:30.167', '2025-12-03 15:36:30.167');
INSERT INTO public.job_positions VALUES ('59c4954b-1d46-48f8-8fd2-d04f0ae427d8', 'Analista Fiscal', 'Responsável pelo cálculo e apuração de impostos, elaboração de obrigações acessórias (SPED, EFD, DCTF), planejamento tributário e análise de legislação fiscal.', true, 3, '2025-12-03 15:36:30.172', '2025-12-03 15:36:30.172');
INSERT INTO public.job_positions VALUES ('c1e6ae1f-e00f-4d3f-8bb9-a913d9305620', 'Assistente Contábil', 'Apoio nas rotinas contábeis, organização de documentos, digitação de lançamentos, arquivamento e controle de prazos.', true, 4, '2025-12-03 15:36:30.176', '2025-12-03 15:36:30.176');
INSERT INTO public.job_positions VALUES ('7e5f562f-e39b-4cf2-b14a-4ad284e1fa65', 'Assistente Fiscal', 'Auxílio nas rotinas fiscais, organização de documentos fiscais, controle de prazos de obrigações acessórias e apoio na apuração de impostos.', true, 5, '2025-12-03 15:36:30.181', '2025-12-03 15:36:30.181');
INSERT INTO public.job_positions VALUES ('9b0bb729-4b6e-4bc1-9f28-60df1e90f561', 'Departamento Pessoal', 'Responsável pelo processamento de folha de pagamento, cálculo de encargos sociais, controle de férias, 13º salário, admissões e demissões.', true, 6, '2025-12-03 15:36:30.187', '2025-12-03 15:36:30.187');
INSERT INTO public.job_positions VALUES ('97b1c34e-dea0-4354-ba0d-be6faf36756a', 'Analista de Departamento Pessoal', 'Análise e processamento de folha de pagamento, cálculo de provisões, controle de benefícios, e-Social e relacionamento com funcionários.', true, 7, '2025-12-03 15:36:30.192', '2025-12-03 15:36:30.192');
INSERT INTO public.job_positions VALUES ('00f8ab49-0f16-452b-b90f-52b0686aeac2', 'Assistente de Departamento Pessoal', 'Apoio nas rotinas de departamento pessoal, organização de documentos, controle de ponto, férias e benefícios.', true, 8, '2025-12-03 15:36:30.195', '2025-12-03 15:36:30.195');
INSERT INTO public.job_positions VALUES ('fbbb6ca4-d786-47fa-8500-eb816bb43309', 'Auxiliar Contábil', 'Auxílio nas rotinas contábeis básicas, organização de documentos, arquivamento e apoio geral ao setor contábil.', true, 9, '2025-12-03 15:36:30.199', '2025-12-03 15:36:30.199');
INSERT INTO public.job_positions VALUES ('d97ccd72-8f18-4d63-988a-506a80217542', 'Auxiliar Fiscal', 'Auxílio nas rotinas fiscais básicas, organização de documentos fiscais, controle de prazos e apoio geral ao setor fiscal.', true, 10, '2025-12-03 15:36:30.203', '2025-12-03 15:36:30.203');
INSERT INTO public.job_positions VALUES ('6369616e-2460-4c8a-83c7-33652ec43b95', 'Estagiário Contábil', 'Estágio na área contábil com aprendizado prático em escrituração, lançamentos contábeis e rotinas administrativas.', true, 11, '2025-12-03 15:36:30.209', '2025-12-03 15:36:30.209');
INSERT INTO public.job_positions VALUES ('000c469b-6a24-455c-b681-c7c5e6d0ef6e', 'Supervisor Fiscal', 'Supervisão de equipe fiscal, revisão de apurações tributárias, garantia de conformidade fiscal e treinamento de colaboradores.', true, 17, '2025-12-03 15:36:30.233', '2025-12-03 15:36:30.233');
INSERT INTO public.job_positions VALUES ('8f6704e0-a8dc-4194-9cf6-7477ccf52f05', 'Gerente Contábil', 'Gestão completa do setor contábil, estratégias de melhoria de processos, relacionamento com clientes de grande porte e liderança de equipe.', true, 18, '2025-12-03 15:36:30.237', '2025-12-03 15:36:30.237');
INSERT INTO public.job_positions VALUES ('268acd56-afe6-4e6c-9ceb-cc79d1ebc332', 'Gerente Fiscal', 'Gestão completa do setor fiscal, planejamento tributário estratégico, relacionamento com clientes de grande porte e liderança de equipe.', true, 19, '2025-12-03 15:36:30.24', '2025-12-03 15:36:30.24');
INSERT INTO public.job_positions VALUES ('990e3049-ae9d-45f6-a261-4e2efe40d8a0', 'Auditor Contábil', 'Realização de auditorias contábeis, análise de controles internos, verificação de conformidade e elaboração de relatórios de auditoria.', true, 20, '2025-12-03 15:36:30.245', '2025-12-03 15:36:30.245');
INSERT INTO public.job_positions VALUES ('01b97fed-0f81-4022-9712-9fc294da1bc3', 'Consultor Contábil', 'Consultoria contábil estratégica, análise de processos, implementação de melhorias e assessoria especializada para clientes.', true, 21, '2025-12-03 15:36:30.249', '2025-12-03 15:36:30.249');
INSERT INTO public.job_positions VALUES ('bb974082-16bb-4522-9cb9-fe9fd09de721', 'Consultor Fiscal', 'Consultoria fiscal estratégica, planejamento tributário, análise de oportunidades fiscais e assessoria especializada para clientes.', true, 22, '2025-12-03 15:36:30.253', '2025-12-03 15:36:30.253');
INSERT INTO public.job_positions VALUES ('fdf6ac7b-6bb0-4182-b847-14510f1a3c86', 'Contador', 'Profissional responsável pela contabilidade geral, escrituração fiscal e tributária, elaboração de demonstrações contábeis e assessoria contábil.', true, 1, '2025-12-03 15:36:30.162', '2025-12-03 15:36:30.162');
INSERT INTO public.job_positions VALUES ('e35b961a-48e5-441d-ae48-5f8228fab041', 'Estagiário Fiscal', 'Estágio na área fiscal com aprendizado prático em apuração de impostos, obrigações acessórias e rotinas fiscais.', true, 12, '2025-12-03 15:36:30.213', '2025-12-03 15:36:30.213');
INSERT INTO public.job_positions VALUES ('e732eb18-b59b-4e8c-82cf-27ea46928c0e', 'Estagiário Departamento Pessoal', 'Estágio na área de departamento pessoal com aprendizado prático em folha de pagamento, e-Social e rotinas de RH.', true, 13, '2025-12-03 15:36:30.216', '2025-12-03 15:36:30.216');
INSERT INTO public.job_positions VALUES ('a030805b-7a2a-4070-945f-a56d79a28621', 'Coordenador Contábil', 'Coordenação da equipe contábil, supervisão de processos, análise de demonstrações contábeis e relacionamento com clientes.', true, 14, '2025-12-03 15:36:30.221', '2025-12-03 15:36:30.221');
INSERT INTO public.job_positions VALUES ('3cf313b4-89d0-4514-abe6-b16ff967ecfe', 'Coordenador Fiscal', 'Coordenação da equipe fiscal, supervisão de processos tributários, planejamento fiscal estratégico e relacionamento com clientes.', true, 15, '2025-12-03 15:36:30.225', '2025-12-03 15:36:30.225');
INSERT INTO public.job_positions VALUES ('2ab58b74-132b-4a97-ba97-c87058d006b5', 'Supervisor Contábil', 'Supervisão de equipe contábil, revisão de trabalhos, garantia de qualidade dos processos e treinamento de colaboradores.', true, 16, '2025-12-03 15:36:30.228', '2025-12-03 15:36:30.228');


--
-- Data for Name: job_applications; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--



--
-- Data for Name: login_page; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.login_page VALUES ('3c742e99-4288-48e2-80f0-2655b3aca1f0', '/uploads/login-page-1764763847463-741425478.png', 'Bem vindo à administração', 'Soluções Contábeis', 'Para o seu negócio', 'Voltar ao Site', 'central-rnc.com.br', 'ArrowRight', '2025-12-02 20:19:42.671', '2025-12-03 12:10:47.469');
INSERT INTO public.login_page VALUES ('e7375df2-904d-4b2f-9c41-c67e5853c252', '/uploads/828fabbe-3630-44c3-91c8-0d37173ff8a2.png', 'We are glad to see you again!', 'Join our next negotiation group in', 'few minutes!', 'Watch demo', '#', 'play', '2025-11-26 19:24:36', '2025-11-25 18:56:10.31');


--
-- Data for Name: newsletter_subscriptions; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--



--
-- Data for Name: privacy_policy; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.privacy_policy VALUES ('949444af-e8f8-4c29-8495-122eacc97a31', 'Política de Privacidade', '<p>Nós da CENTRAL CONTÁBIL nos preocupamos com a privacidade e com a segurança dos dados de nossos clientes e por isso, pautados na Lei Geral de Proteção de Dados Pessoais (LGPD) – Lei 13.709/2018, preparamos esta política de privacidade para que você, titular dos dados pessoais, tenha acesso, com total transparência, a informações sobre as atividades de tratamento que realizamos e sobre seus direitos.</p><p>Esta política de privacidade fornece informações relevantes sobre privacidade de dados, incluindo sobre as suas escolhas como cliente, referentes à coleta, utilização e compartilhamento de certas informações, como suas informações pessoais, pela CENTRAL CONTÁBIL.</p><p><br></p><h2><strong>COMO ENTRAR EM CONTATO COM A CENTRAL CONTÁBIL</strong></h2><p><br></p><p>Caso tenha dúvidas gerais sobre sua conta ou sobre como entrar em contato conosco acesse nosso site https://central-rnc.com.br/. Para questões específicas sobre esta política de privacidade, incluindo a utilização de informações pessoais, cookies e outras tecnologias semelhantes, entre em contato com o nosso Encarregado (Data Protection Officer – DPO) por e-mail no endereço&nbsp;privacidade@central-rnc.com.br.</p><p>Se você entrar em contato conosco solicitando assistência, para sua segurança e da CENTRAL CONTÁBIL, poderá ser preciso autenticar sua identidade antes de atender ao seu pedido.</p><p><br></p><h2><strong>Para execução nos nossos serviços de assessoria contábil, a CENTRAL CONTÁBIL recebe e armazena informações sobre nossos clientes, tais como:</strong></h2><p><br></p><p>1. Dados de clientes – como nome, nome da mãe, nome da mãe, endereço, telefone, local e data de nascimento, sexo, estado civil, nome do cônjuge, regime de casamento, renda mensal, nº de CPF, número e série da CTPS, nº do PIS, Carteira de Identidade, Título de Eleitor, nº da CNH, cor/raça, deficiência ou não.</p><p>2. Dados de dependentes – como nome, data e local de nascimento, nº de CPF, dados de conta bancária para eventual restituição de imposto de renda, informe de rendimentos, informes bancários, resumo mensal de compra e venda de ações, recibos de pagamentos ou informe de rendimento de plano ou seguro de saúde, despesas médicas e odontológicas em geral, recibos de doações.</p><p>3. Demais dados do usuário contidos Receita Federal, Estadual e Bancos em geral, estritamente necessários para exercício e prestação de nossos serviços.</p><p><br></p><h2><strong>Além disso, também para execução de nossos serviços de assessoria contábil, solicitamos de nossos clientes cópia de alguns documentos, como:</strong></h2><p><br></p><p>1. cópia da certidão de nascimento dos dependentes menores de 14 anos e comprovante de residência, para admissão dos empregados de nossas empresas clientes;</p><p>2. cópia do recibo e da declaração de imposto de renda entregue no ano anterior, documentos comprobatórios de compra e venda de bens e direitos, comprovante de despesas com educação, comprovante de pagamento de previdência social e privada e comprovante de recolhimento de INSS, para realizar declaração de imposto de renda de nossos clientes pessoas físicas;</p><p>3. cópia de documento de identificação de titulares de dados pessoais, para abertura/fechamento/alteração de empresas.</p><p>As informações são coletadas de diversas formas, tendo especial relevância a coleta por meio de mensagens e e-mails enviados pelos titulares de dados pessoais, nossos clientes.</p><p>Informações coletadas automaticamente: além das informações recebidas, nós coletamos automaticamente algumas informações sobre suas interações conosco, geolocalização, hábitos de consumo, preferências, interesses, assim como informações sobre sua rede, seus aparelhos de rede, seu computador e outros aparelhos utilizados para acessar nosso site ou usufruir de nossos serviços (tais como, aparelhos móveis e outros aparelhos/dispositivos que acessem nossos serviços). Tais informações incluem:</p><p>1. Coleta de e-mail do titular e interações com nossas mensagens de texto; eventualmente utilizamos a ferramentas de e-mail marketing para informar nossos clientes/usuários sobre fatos relevantes relacionados aos nossos serviços. Caso o cliente/usuário não deseje receber esses e-mails, é possível clicar em “unsubscribe” (desinscrever-se) da lista de e- mails ao final do corpo do e-mail.</p><p>2. Detalhes sobre suas interações com o serviço de atendimento, tais como, no caso de chamadas, o seu número de telefone;</p><p>3. IDs ou outros identificadores únicos de aparelhos;</p><p>4. Características de aparelhos e software (tais como o tipo e configuração), informações sobre a conexão, estatísticas sobre visualizações de página, endereço IP, navegador e dados padrão de logs de servidores da Internet;</p><p>5. Informações coletadas pelo uso de cookies e outras tecnologias, incluindo dados de anúncios. Consulte a seção “Cookies e publicidade na Internet” para obter mais detalhes.</p><p>Informações de outras fontes: protegemos essas informações de acordo com as práticas descritas nesta política de privacidade, além de respeitar as restrições adicionais impostas pela fonte dos dados. Essas fontes variam no decorrer do tempo, mas podem incluir fontes disponíveis ao público, como bancos de dados abertos do governo.</p><h2><br></h2><h2><strong>USO DE INFORMAÇÕES</strong></h2><p><br></p><p>Nós utilizamos as informações coletadas para cumprimento de nossas obrigações legais e regulatórias decorrentes de nossos serviços perante órgãos governamentais, bem como para executar os contratos de assessoria contábil realizados com nossos clientes. Além disso, utilizamos essas informações para oferecer, administrar, aprimorar e personalizar nossos serviços, para promovermos a defesa da empresa em procedimentos judiciais, administrativos ou arbitrais, e, para nos comunicarmos com você sobre esses e outros assuntos.</p><h2><br></h2><h2><strong>COMPARTILHAMENTO DE INFORMAÇÕES</strong></h2><p><br></p><p>A CENTRAL CONTÁBIL compartilhará seus dados para fins específicos para terceiros, conforme descrição abaixo:</p><p>Prestadores de Serviços:&nbsp;a CENTRAL CONTÁBIL poderá contratar outras empresas ou terceiros para fornecer serviços em seu nome ou ajudar no fornecimento de serviços destinados a você. A título de exemplo, a CENTRAL CONTÁBIL contrata prestadores de serviços para gerir a coleta e armazenamento de notas fiscais, controle de certidões e alvarás, além de dispor de assessoria jurídica especializada para apoio dos clientes (com o aceite desses), garantindo a sua e a nossa segurança, para personalizar e otimizar o serviço oferecido. No decorrer das atribuições desempenhadas pela CENTRAL CONTÁBIL, esses prestadores de serviços podem ter acesso a suas informações pessoais ou de outra natureza. Não autorizamos estas empresas a usar ou compartilhar seus dados pessoais, a não ser com a finalidade de fornecer os serviços contratados pela CENTRAL CONTÁBIL.</p><p>Cumprimento de obrigações legais e regulatórias: enquanto assessoria contábil, a CENTRAL CONTÁBIL precisa realizar o compartilhamento constante de informações com órgãos governamentais, como: Receita Federal, SEFAZ/ES, Juntas Comerciais, dentre outros. Nesse caso, o compartilhamento de informações é fundamental para execução dos serviços contratados pelos clientes da CENTRAL CONTÁBIL e titulares de dados pessoais. Proteção da CENTRAL CONTÁBIL e outros:&nbsp;a CENTRAL CONTÁBIL e seus prestadores de serviços poderão compartilhar ou, de outra forma, utilizar suas informações pessoais quando a CENTRAL CONTÁBIL ou tais empresas tiverem motivos razoáveis para acreditar que tal divulgação é necessária para (a) atender a alguma lei ou norma aplicável, processo legal ou solicitação governamental, (b) fazer cumprir os termos de uso aplicáveis, incluindo a investigação de potenciais infrações destes, (c) detectar, prevenir ou endereçar atividades ilegais ou suspeitas (inclusive fraude de pagamentos), problemas técnicos ou de segurança ou (d) proteger-se contra infrações aos direitos, propriedade ou segurança da CENTRAL CONTÁBIL, de seus usuários ou do público, conforme requerido ou permitido por lei.</p><p>Transferência de propriedade:&nbsp;em relação a qualquer reorganização, reestruturação, fusão ou venda, ou transferência de ativos, a CENTRAL CONTÁBIL transferirá informações, incluindo informações pessoais, desde que a parte receptora se comprometa a respeitar suas informações pessoais de maneira condizente com nossa política de privacidade.</p><p>No curso do compartilhamento de dados, sempre que transferirmos informações pessoais a países fora do território nacional e outras regiões com leis abrangentes de proteção de dados, nós nos certificaremos de que as informações sejam transferidas segundo esta política de privacidade e conforme permitido pela legislação de proteção de dados aplicável.</p><h2><br></h2><h2><strong>SUAS INFORMAÇÕES E DIREITOS</strong></h2><p><br></p><p>Você pode solicitar acesso às suas informações pessoais, bem como pode corrigir ou atualizar informações pessoais desatualizadas ou incorretas que temos sobre você. Para isso bastar nos enviar uma comunicação através do endereço de e-mail privacidade@central-rnc.com.br nos informando quais informações que temos sobre você que deseja corrigir ou atualizar. Você também pode solicitar que a CENTRAL CONTÁBIL exclua suas informações pessoais (quando tal eliminação for possível).</p><p>Respondemos a todas as solicitações que recebemos de indivíduos que queiram exercer os seus direitos de proteção de dados em conformidade com as respectivas leis de proteção de dados. A CENTRAL CONTÁBIL poderá rejeitar solicitações que sejam desarrazoadas ou não exigidas por lei, como aquelas que sejam extremamente impraticáveis, capazes de exigir um esforço técnico desproporcional ou que possa nos expor a riscos operacionais. A CENTRAL CONTÁBIL poderá reter informações conforme exigência ou permissão prevista em leis e regulamentos aplicáveis, inclusive para honrar suas escolhas, para fins de cobrança ou registros e para atender às finalidades descritas nesta Política de Privacidade. A CENTRAL CONTÁBIL tomará medidas razoáveis para destruir ou anonimizar informações pessoais de forma segura quando deixam de ser necessárias. A CENTRAL CONTÁBIL tem ciência da obrigação legal das empresas em eliminar dados pessoais ao fim da finalidade para as quais eles foram obtidos. SEGURANÇA Nós levamos sua privacidade a sério e tomamos as medidas e precauções razoáveis para proteger seus dados pessoais. Trabalhamos para protegê-lo contra acessos não autorizados, alterações acidentais ou ilícitas, divulgações ou destruições de seus dados pessoais. A CENTRAL CONTÁBIL emprega medidas administrativas, lógicas e físicas razoáveis para proteger suas informações pessoais, essas medidas são elaboradas para oferecer um nível de segurança adequado aos riscos de processamento de suas informações pessoais, incluindo: utilização de controle de acesso interno às pastas através de autenticação de usuários; as conexões via internet são protegidas por firewall físico (Fortinet) e os acessos externos são todos autenticados e criptografados por VPN; utilização de ferramenta de antivírus; realização de backups periódicos de nossa base de dados. Ressaltamos que a transmissão de informações pela internet possui vários atores e várias formas de vazamento, que podem, inclusive, vir de seu próprio computador. Por isso, não podemos garantir a segurança completa de todos os dados que você envia pela internet, somente daqueles que estão em nosso controle. No mais, você é responsável por manter em sigilo sua senha utilizada para acessar nossos sistemas e serviços. Esta medida impede que acessos indesejados ao seu perfil aconteçam. Jamais solicitaremos o envio desta senha por e-mail, SMS ou qualquer outro meio de contato. ALTERAÇÕES NA PRESENTE POLÍTICA DE PRIVACIDADE A CENTRAL CONTÁBIL poderá alterar periodicamente esta política de privacidade para atender a mudanças na legislação, exigências regulatórias ou operacionais. Comunicaremos qualquer alteração (inclusive a data em que esta entrar em vigor) conforme previsto por lei. Caso você não queira reconhecer ou aceitar nenhuma das atualizações desta política de privacidade, você poderá assim nos informar através do e-mail: privacidade@central-rnc.com.br. Para saber quando essa política de privacidade foi atualizada pela última vez, consulte a seção “Última atualização”, no fim deste documento. COOKIES E PUBLICIDADE NA INTERNET A CENTRAL CONTÁBIL e os nossos prestadores de serviços contratados utilizam cookies. Por exemplo, utilizamos essas tecnologias para facilitar o seu acesso a nossos serviços, permitindo-nos reconhecer você a cada vez que você volta, e para analisar nossos serviços. Nós queremos informá-lo do nosso uso dessas tecnologias. Assim, esta seção explica quais tipos de tecnologias utilizamos, sua função e suas opções em relação ao seu uso. 1. O que são cookies? Cookies são pequenos arquivos de dados, armazenados normalmente no seu aparelho enquanto você navega e utiliza sites e serviços online. Cookies são bastante utilizados para que sites funcionem ou funcionem de forma mais eficiente, bem como para gerar informações de relatórios e ajudar na personalização do serviço ou publicidade. Os cookies não são os únicos tipos de tecnologias que permitem essa funcionalidade. Também usamos outros tipos de tecnologias semelhantes. Consulte os itens abaixo para obter mais informações e exemplos. 2. Por que a CENTRAL CONTÁBIL usa cookies? Cookies essenciais:&nbsp;esses cookies são estritamente necessários para fornecer nosso serviço online ou website. Por exemplo, nós podemos usar esses cookies para autenticar e identificar nossos usuários quando eles usam nossos sites e aplicativos, e, para que possamos fornecer serviços a eles. Os cookies também nos ajudam a prevenir fraudes e manter a segurança do nosso serviço. Cookies de desempenho, analíticos ou de funcionalidade:&nbsp;esses cookies não são essenciais, mas nos ajudam a personalizar e aprimorar a sua experiência online com a CENTRAL CONTÁBIL. Por exemplo, eles nos ajudam a lembrar de suas preferências e evitar que você precise digitar informações que você já forneceu. A exclusão desses tipos de cookies poderá resultar em funcionalidade limitada do nosso serviço. Cookies de publicidade/marketing: esses cookies são utilizados para fornecer conteúdos relevantes e específicos aos seus interesses. Também podem ser utilizados para apresentar publicidade com um maior direcionamento. Ainda permitem a medição da eficácia de uma campanha lançada. Esses anúncios destinam-se exclusivamente a torná-lo ciente de promoções relevantes. A CENTRAL CONTÁBIL não vende dados de clientes a terceiros. Cookies de terceiros: Importante esclarecer que a CENTRAL CONTÁBIL não se responsabiliza pelo uso de cookies de plataformas de terceiros. Fique atento, pois os cookies instalados em decorrência da sua interação com plataformas de terceiros podem eventualmente continuar a monitorar as suas atividades online mesmo depois da sua interação com as plataformas, sendo recomendável que você limpe seu histórico de navegação regularmente para se certificar de que seu dispositivo utiliza apenas as tecnologias do seu interesse. 3. Como eu posso fazer escolhas em relação a cookies?&nbsp;Para obter mais informações sobre cookies definidos por meio do nosso site e sobre outros tipos de monitoramento online (inclusive a coleta de informações sobre suas atividades online por terceiros ao longo do tempo e em sites de terceiros ou por serviços online de publicidade baseada em interesses) e como fazer escolhas em relação a eles,&nbsp;nos envie um e-mail para (privacide@central-rnc.com.br). Para optar por não receber da CENTRAL CONTÁBIL anúncios baseados em interesse exibidos em conexão com um identificador de aparelho redefinível em um aparelho móvel, tablet ou outro aparelho, configure a respectiva opção no seu aparelho (geralmente em “privacidade” ou “anúncios” nas configurações do aparelho). É possível que continue a ver anúncios da CENTRAL CONTÁBIL no seu aparelho, mas não serão personalizados de acordo com os seus prováveis interesses. Se você quiser saber quais cookies estão instalados no seu computador ou notebook, ou se deseja excluí-los ou restringi-los, você pode utilizar as configurações do seu navegador para isso. Você encontrará mais explicações sobre como proceder clicando nos links abaixo:</p><p>Para fazer essas solicitações ou caso você tenha qualquer outra dúvida sobre nossa política de privacidade, escreva para nosso Encarregado (Data Protection Officer – DPO) por e-mail no endereço&nbsp;privacidade@central-rnc.com.br.</p><p><br></p><p><br></p><h2><strong>Nosso site utiliza cookies padrões de navegação de site e outros, tais como:</strong></h2></p>
<table width="567">
<tbody>
<tr>
<td width="104"><strong>Nome</strong></td>
<td width="66"><strong>Hostname</strong></td>
<td width="85"><strong>Categoria</strong></td>
<td width="236"><strong>Descrição</strong></td>
<td width="76"><strong>Duração</strong></td>
</tr>
<tr>
<td width="104"><strong>_GRECAPTCHA</strong></td>
<td width="66">www.google.com</td>
<td width="85">Necessário</td>
<td width="236"><em>Usado pelo Google reCaptcha para análise de risco</em></td>
<td width="76">6 meses</td>
</tr>
<tr>
<td width="104"><strong>_grecaptcha</strong></td>
<td width="66">www.google.com</td>
<td width="85">Necessário</td>
<td width="236"><em>Cookie configurado pelo Google reCaptcha, que protege o site contra spam em formulários de contato</em></td>
<td width="76">Ao longo da sessão</td>
</tr>
<tr>
<td width="104"><strong>_ga_*</strong></td>
<td width="66">.central-rnc.com.br</td>
<td width="85">Cookie Analítico</td>
<td width="236"><em>Contém um identificador único, utilizado pelo Google Analytics 4 para determinar que dois “hits” distintos pertencem ao mesmo usuário durante a navegação</em></td>
<td width="76">1 ano</td>
</tr>
<tr>
<td width="104"><strong>_ga</strong>

<strong> </strong></td>
<td width="66">.central-rnc.com.br</td>
<td width="85">Cookie Analítico</td>
<td width="236"><em>Contém um identificador único, utilizado pelo Google Analytics  para determinar que dois “hits” distintos pertencem ao mesmo usuário durante a navegação</em></td>
<td width="76">1 ano</td>
</tr>
<tr>
<td width="104"><strong>_gid</strong></td>
<td width="66">.central-rnc.com.br</td>
<td width="85">Cookie Analítico</td>
<td width="236"><em>Contém um identificador único, utilizado pelo Google Analytics para determinar que dois “hits” distintos pertencem ao mesmo usuário durante a navegação</em></td>
<td width="76">1 dia</td>
</tr>
<tr>
<td width="104"><strong>_gat</strong></td>
<td width="66">.central-rnc.com.br</td>
<td width="85">Cookie Analítico</td>
<td width="236"><em>Utilizado pelo Google Analytics para aceleraro ritmo de solicitações (limitar a coleta de dados em sites com tráfego alto)</em></td>
<td width="76">38 minutos</td>
</tr>
<tr>
<td width="104"><strong>__trf.src</strong></td>
<td width="66">.central-rnc.com.br</td>
<td width="85">Cookie Analítico</td>
<td width="236"><em>Guardar a referência da origem da visita do usuário ao site</em></td>
<td width="76">1 ano</td>
</tr>
<tr>
<td width="104"><strong>rdtrk</strong></td>
<td width="66">.central-rnc.com.br</td>
<td width="85">Cookie Analítico</td>
<td width="236"><em>Guardar a lista de todas as páginas que o visitante acessou dentro do seu domínio, mesmo antes da conversão</em></td>
<td width="76">1 ano</td>
</tr>
</tbody>
</table>', '/uploads/724ab80c-337b-46a4-bddd-8daa69fd086c.jpg', '2025-11-24 17:38:19.637');


--
-- Data for Name: recruitment_processes; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--



--
-- Data for Name: recruitment_stages; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--



--
-- Data for Name: recruitment_candidates; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--



--
-- Data for Name: recruitment_candidate_stages; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--



--
-- Data for Name: recruitment_notes; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--



--
-- Data for Name: section_about; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.section_about VALUES ('e2e584d9-12b8-412b-8fbe-8e393aa86448', 'Sobre Nós', 'Quem Somos', NULL, 'Com mais de 36 anos de atuação, a Central Contábil – Soluções Empresariais é uma das maiores e mais experientes empresas de Contabilidade do Estado do Espírito Santo. Nossas soluções vão além da contabilidade tradicional: atuamos de forma integrada e estratégica para que o seu negócio tenha a melhor performance contábil, fiscal e tributária.', '/uploads/62c2ccd7-5811-48c0-a081-559cfa9799fa.png', '34+', '500+', 'RNC', 'Anos', '36+', 'Clientes', '500+', 'Rede', 'RNC', '2025-12-03 13:00:38.592');
INSERT INTO public.section_about VALUES ('695650d8-226e-4346-a123-5a1bab330e75', 'Sobre Nós', 'Quem Somos', NULL, 'Com mais de 36 anos de atuação, a Central Contábil – Soluções Empresariais é uma das maiores e mais experientes empresas de Contabilidade do Estado do Espírito Santo. Nossas soluções vão além da contabilidade tradicional: atuamos de forma integrada e estratégica para que o seu negócio tenha a melhor performance contábil, fiscal e tributária.', '/uploads/0d34157c-00e5-4a87-882c-31b76175a56b.png', '36+', '500+', 'RNC', 'Anos', '36+', 'Clientes', '500+', 'Associado', 'RNC', '2025-11-21 18:36:39.696');


--
-- Data for Name: section_about_images; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.section_about_images VALUES ('e66ece0f-5479-4604-a254-69c10ec049f6', 'e2e584d9-12b8-412b-8fbe-8e393aa86448', '/uploads/3ab0328e-59c1-4b5d-b1d3-a6ed88853c93.jpg', 'Equipe de Especialistas', 0, true, '2025-12-03 13:19:37.477', '2025-12-03 13:19:37.477');
INSERT INTO public.section_about_images VALUES ('64965aa6-eee2-4a93-8778-a9ee677334c7', 'e2e584d9-12b8-412b-8fbe-8e393aa86448', '/uploads/a36ae5a0-9083-4d51-800c-c3ac64be44a2.jpg', 'Estrutura Moderna', 1, true, '2025-12-03 13:19:53.312', '2025-12-03 13:19:53.312');
INSERT INTO public.section_about_images VALUES ('2cdccc5d-6124-4f6b-bdf5-f7403bbb265a', 'e2e584d9-12b8-412b-8fbe-8e393aa86448', '/uploads/58a7804f-49ef-4e40-8f3a-8e5f1cd2336b.jpg', 'Clientes Selecionados', 2, true, '2025-12-03 13:20:07.096', '2025-12-03 13:20:07.096');
INSERT INTO public.section_about_images VALUES ('121464a7-fb7c-49c1-9f70-a5d14931f290', '695650d8-226e-4346-a123-5a1bab330e75', '/uploads/6504c2c8-798e-4720-8c0c-bb4f5ca2f2c0.jpg', 'Equipe de Especialistas', 0, true, '2025-12-05 13:39:14.855', '2025-12-05 13:39:14.855');
INSERT INTO public.section_about_images VALUES ('3bf5dbd5-30b4-4273-9a0c-40d6bed5a998', '695650d8-226e-4346-a123-5a1bab330e75', '/uploads/9477fd4f-b8fa-42be-bbef-24f61614380e.jpg', 'Estrutura Moderna', 1, true, '2025-12-05 13:39:14.855', '2025-12-05 13:39:14.855');
INSERT INTO public.section_about_images VALUES ('d856421c-9a9a-4a6b-9209-168cae459eea', '695650d8-226e-4346-a123-5a1bab330e75', '/uploads/dcbfc872-fe70-4b8f-b444-544c499efff8.jpg', 'Clientes Selecionados', 2, true, '2025-12-05 13:39:14.855', '2025-12-05 13:39:14.855');


--
-- Data for Name: section_certifications; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.section_certifications VALUES ('cert-1', 'Shield', 'Rede Nacional de Contabilidade', 'RNC', 'Associados à maior rede de contabilidade do Brasil', 1, true, '2025-11-21 14:12:49.626', '2025-11-21 14:12:49.626');
INSERT INTO public.section_certifications VALUES ('cert-3', 'CheckCircle', 'ISO 9001', 'ISO', 'Padrões internacionais de qualidade em nossos processos', 3, true, '2025-11-21 14:12:49.627', '2025-11-21 14:12:49.627');
INSERT INTO public.section_certifications VALUES ('cert-2', 'Award', 'Grupo Master', 'GM', 'Integrantes do Grupo Master de Contabilidade Consultiva', 2, true, '2025-11-21 14:12:49.627', '2025-11-21 14:12:49.627');


--
-- Data for Name: section_clients; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.section_clients VALUES ('b8334507-67a2-4a5a-8f14-dc508fe84b30', 'Empresas que Confiam em Nosso Trabalho', '/uploads/39b90ce0-444c-4011-92a2-5ebdf389205a.jpg', '2025-12-02 20:18:30.411', '2025-12-03 13:54:36.423');
INSERT INTO public.section_clients VALUES ('4a35f190-797c-4d7c-90ea-23a0899c39ee', 'Empresas que Confiam em Nosso Trabalho', '/uploads/e2f6d418-0ccd-45e7-a8b8-d51d3fa27f9a.jpg', '2025-11-24 16:49:15.592', '2025-11-24 18:02:49.796');


--
-- Data for Name: section_features; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.section_features VALUES ('feature-1', 'Shield', 'Conformidade Garantida', 'Garantimos total conformidade fiscal e tributária para seu negócio', 1, true, '2025-11-21 14:12:49.411', '2025-11-21 14:12:49.411');
INSERT INTO public.section_features VALUES ('feature-6', 'Award', 'Excelência Comprovada', 'Mais de 36 anos de tradição e milhares de clientes satisfeitos', 6, true, '2025-11-21 14:12:49.411', '2025-11-24 19:59:15.624');
INSERT INTO public.section_features VALUES ('feature-3', 'Settings', 'Soluções Personalizadas', 'Consultoria adaptada às necessidades específicas do seu negócio', 3, true, '2025-11-21 14:12:49.411', '2025-11-21 14:12:49.411');
INSERT INTO public.section_features VALUES ('feature-4', 'TrendingUp', 'Otimização Tributária', 'Redução legal da carga tributária com estratégias inteligentes', 4, true, '2025-11-21 14:12:49.411', '2025-11-21 14:12:49.411');
INSERT INTO public.section_features VALUES ('feature-2', 'Zap', 'Agilidade nos Processos', 'Entregas rápidas e eficientes sem comprometer a qualidade', 2, true, '2025-11-21 14:12:49.411', '2025-11-21 14:12:49.411');
INSERT INTO public.section_features VALUES ('feature-5', 'Users', 'Equipe Qualificada', 'Profissionais certificados e atualizados com as últimas normas', 5, true, '2025-11-21 14:12:49.411', '2025-11-21 14:12:49.411');


--
-- Data for Name: section_fiscal_benefits; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.section_fiscal_benefits VALUES ('7f7a5080-9794-450d-bf23-1993a0816cc8', 'FileText', 'Fundap', 'Fundo de Desenvolvimento e Apoio à Pesquisa do Espírito Santo, oferecendo incentivos para pesquisa e desenvolvimento.', 'fundap', '<h2>O que é o Fundap?</h2>
<p>O Fundap (Fundo de Desenvolvimento e Apoio à Pesquisa do Espírito Santo) é um programa do Governo do Espírito Santo que oferece incentivos fiscais para empresas que investem em pesquisa, desenvolvimento e inovação.</p>

<h2>Principais Benefícios</h2>
<ul>
  <li>Redução de ICMS sobre investimentos em P&D</li>
  <li>Créditos fiscais para projetos de pesquisa</li>
  <li>Apoio financeiro a projetos de inovação</li>
  <li>Parcerias com instituições de pesquisa</li>
  <li>Incentivos para desenvolvimento de novas tecnologias</li>
  <li>Benefícios para empresas de base tecnológica</li>
</ul>

<h2>Quem pode se beneficiar?</h2>
<p>Empresas que investem em pesquisa, desenvolvimento e inovação no Espírito Santo, especialmente aquelas que desenvolvem novos produtos, processos ou tecnologias, e empresas de base tecnológica.</p>

<h2>Requisitos</h2>
<ul>
  <li>Investimento em projetos de P&D aprovados</li>
  <li>Parcerias com instituições de pesquisa reconhecidas</li>
  <li>Regularidade fiscal e trabalhista</li>
  <li>Projetos que contribuam para o desenvolvimento tecnológico do estado</li>
  <li>Comprovação de gastos com pesquisa e desenvolvimento</li>
</ul>

<h2>Como funciona?</h2>
<p>O programa oferece créditos fiscais e reduções de ICMS para empresas que investem em projetos de pesquisa e desenvolvimento aprovados, incentivando a inovação e o desenvolvimento tecnológico no estado.</p>

<h2>Áreas de Atuação</h2>
<p>O Fundap prioriza projetos nas áreas de tecnologia, inovação, desenvolvimento de produtos, processos industriais, biotecnologia e outras áreas estratégicas para o desenvolvimento econômico do Espírito Santo.</p>

<h2>Parcerias com Instituições</h2>
<p>O programa incentiva parcerias entre empresas e instituições de pesquisa, universidades e centros tecnológicos, promovendo a transferência de conhecimento e tecnologia.</p>', 'Programa que oferece incentivos fiscais para empresas que investem em pesquisa, desenvolvimento e inovação no Espírito Santo.', NULL, 8, true, '2025-11-21 19:23:03.352', '2025-11-21 19:23:03.352');
INSERT INTO public.section_fiscal_benefits VALUES ('benefit-2', 'ShoppingBag', 'Compete Atacadista', 'Incentivo fiscal específico para empresas do setor atacadista.', 'compete-atacadista', '', NULL, NULL, 2, true, '2025-11-21 14:12:49.534', '2025-11-21 19:03:27.784');
INSERT INTO public.section_fiscal_benefits VALUES ('benefit-3', 'Package', 'Compete E-Commerce', 'Benefícios fiscais para empresas de comércio eletrônico.', 'compete-e-commerce', '', NULL, NULL, 3, true, '2025-11-21 14:12:49.534', '2025-11-21 19:03:27.79');
INSERT INTO public.section_fiscal_benefits VALUES ('benefit-1', 'Award', 'Compete-ES', 'Programa de incentivo fiscal para empresas que investem no Espírito Santo.', 'compete-es', '<p>O <strong>COMPETE-ES</strong> é um programa estadual de incentivos fiscais do Espírito Santo voltado à redução da carga de ICMS para empresas que contribuem com o desenvolvimento econômico do Estado, por meio de geração de empregos, investimentos e fortalecimento da atividade produtiva e de distribuição.</p><p><br></p><p><br></p><h3><strong>1. O que é o COMPETE-ES</strong></h3><p><br></p><p>O <strong>COMPETE-ES</strong> foi instituído por legislação estadual específica com o objetivo de:</p><p><br></p><p>Estimular a instalação, expansão ou modernização de empresas no Espírito Santo;</p><p>Gerar e manter empregos formais no Estado;</p><p>Aumentar a competitividade tributária das empresas capixabas frente a outros estados;</p><p>Fomentar cadeias logísticas, de comércio atacadista, indústria e comércio eletrônico.</p><p>Em linhas gerais, o programa concede um tratamento tributário diferenciado de ICMS (normalmente com alíquota efetiva reduzida em determinadas operações), mediante adesão formal da empresa, assinatura de contrato e cumprimento de requisitos como geração de empregos, investimentos mínimos e regularidade fiscal.</p><p><br></p><p><br></p><h3><strong>2. Principais Modalidades do COMPETE-ES</strong></h3><p>Ao longo do tempo, o COMPETE-ES passou a ser aplicado a diferentes perfis de empresas e operações. Entre as modalidades mais comuns, destacam-se:</p><p><br></p><p><br></p><p><strong>2.1 COMPETE Atacadista</strong></p><p>Modalidade voltada a empresas atacadistas estabelecidas no Espírito Santo, com foco em operações de circulação de mercadorias para outros estados (vendas interestaduais).</p><p><br></p><p>Redução significativa da carga de ICMS nas operações de venda interestadual;</p><p>Regras específicas sobre estrutura física (como área de armazenagem) e número mínimo de empregos;</p><p>Aplicação em mercadorias e CFOPs definidos em norma e no contrato firmado com o Estado.</p><p><br></p><p><strong>2.2 COMPETE para Comércio Eletrônico / Vendas Não Presenciais</strong></p><p>Pensado para empresas que operam por e-commerce, televendas e outras modalidades de venda não presencial, com destaque para operações de remessa de mercadorias para fora do ES:</p><p><br></p><p>Envolve vendas interestaduais destinadas a consumidores ou empresas em outras unidades da Federação;</p><p>Possibilita uma alíquota efetiva de ICMS significativamente reduzida nas saídas amparadas pelo regime;</p><p>Exige emissão de NF-e, controle de estoques, estrutura mínima (própria ou por meio de operador logístico local), além de regularidade fiscal.</p><p><br></p><p><strong>2.3 Outras Aplicações</strong></p><p>A depender da legislação vigente e dos ajustes promovidos pelo Estado, o COMPETE-ES pode dialogar com outros segmentos, como:</p><p><br></p><p>Indústrias com foco em vendas interestaduais e/ou exportação;</p><p>Centros de distribuição e operações logísticas;</p><p>Empresas que operam em arranjos com operadores logísticos e depósitos de terceiros.</p><p><br></p><h3><strong>3. Benefícios e Vantagens do COMPETE-ES</strong></h3><p>Para empresas que se enquadram nos requisitos, o COMPETE-ES representa um importante diferencial competitivo. Entre as principais vantagens:</p><p><br></p><p>Redução expressiva da carga de ICMS em determinadas operações, especialmente vendas interestaduais, com alíquota efetiva muitas vezes próxima de 1%–1,1% do valor da operação (a depender da legislação e do contrato firmado);</p><p>Aumento de margem de lucro ou possibilidade de praticar preços mais competitivos em relação a concorrentes de outros estados;</p><p>Estímulo à expansão comercial, abertura de novas frentes de venda e ampliação da participação de mercado;</p><p>Fortalecimento da logística e distribuição a partir do Espírito Santo, com potencial para atrair investimentos em infraestrutura;</p><p>Contribuição para a geração e manutenção de empregos no Estado, que é uma das contrapartidas típicas exigidas pelo programa.</p><p><br></p><h3><strong>4. Quem Pode se Beneficiar</strong></h3><p>O enquadramento da empresa no COMPETE-ES depende da modalidade e das regras específicas em vigor, mas, de forma geral, exigem-se:</p><p><br></p><p>Estabelecimento no Espírito Santo (matriz ou filial) regularmente inscrito no cadastro estadual de contribuintes do ICMS;</p><p>Regime de tributação adequado, em geral empresas fora do Simples Nacional, enquadradas no Lucro Presumido ou Lucro Real;</p><p>Regularidade fiscal e cadastral perante o Estado, sem pendências impeditivas;</p><p>Estrutura operacional compatível com a modalidade pretendida (ex.: para atacadista, área de armazenagem mínima, número de postos de trabalho, controles de estoque, etc.);</p><p>Compromisso com metas de empregos, investimentos e movimentação econômica pactuadas em contrato com o Estado;</p><p>Atuação em operações alcançadas pelo regime diferenciado: vendas interestaduais, e-commerce, televendas e demais operações não presenciais enquadradas.</p><p><br></p><h3><strong>5. Limitações, Vedações e Obrigações</strong></h3><p>O COMPETE-ES não é um benefício automático. Ele depende de adesão formal e observância de diversas exigências legais. Entre os principais pontos de atenção:</p><p><br></p><p>Vendas simuladas ou desvirtuadas: há vedações para operações que, na prática, configuram saídas internas disfarçadas de interestaduais (por exemplo, certas operações de venda à ordem em que o consumo real ocorre no próprio ES);</p><p>Necessidade de manter rigoroso controle contábil e fiscal, incluindo:</p><p>Escrituração correta das operações alcançadas pelo benefício;</p><p>Controles de estoque e rastreabilidade das mercadorias, especialmente em remessas para armazéns e depósitos em outros estados;</p><p>Separação clara entre operações incentivadas e não incentivadas.</p><p>Obrigatoriedade de regularidade fiscal contínua; pendências relevantes podem ensejar suspensão ou cancelamento do regime;</p><p>Cumprimento das metas contratadas com o Estado (empregos, investimentos, estrutura física, etc.); o descumprimento pode gerar:</p><p>Perda parcial ou total do benefício;</p><p>Cobrança de ICMS “cheio” com acréscimos (multa e juros);</p><p>Reavaliação ou revogação do contrato de competitividade.</p><p>Observância de obrigações acessórias específicas, inclusive eventuais comunicações periódicas a órgãos do Estado.</p><p><br></p><h3><strong>6. Importância Econômica para o Espírito Santo</strong></h3><p>O COMPETE-ES é uma das principais ferramentas de política de desenvolvimento econômico do Espírito Santo. Seu desenho busca:</p><p><br></p><p>Atrair e reter empresas no Estado por meio de um ambiente tributário mais competitivo;</p><p>Estimular a instalação de centros de distribuição, operações atacadistas e e-commerces com base logística no ES;</p><p>Aumentar a circulação de mercadorias, o valor adicionado fiscal e a arrecadação de ICMS no longo prazo, ainda que com alíquota reduzida em algumas operações;</p><p>Promover a diversificação econômica e consolidar o Estado como hub logístico e comercial, aproveitando sua posição geográfica estratégica.</p><p><br></p><h3><strong>7. Pontos de Atenção para Empresas Interessadas</strong></h3><p>Empresas que avaliam ingressar no COMPETE-ES devem considerar:</p><p><br></p><p>A necessidade de um estudo de viabilidade tributária e operacional, cruzando:</p><p>Perfil de operações (atacado, varejo, e-commerce, indústria, logística);</p><p>Volume de vendas interestaduais e potencial de crescimento;</p><p>Estrutura física, número de empregados e capacidade de atendimento às exigências;</p><p>Enquadramento em demais benefícios que possam coexistir com o COMPETE-ES.</p><p>A importância de roteirizar corretamente as operações (CFOP, CST, base de cálculo, alíquota, partilha interestadual, etc.) para refletir a tributação diferenciada sem riscos de autuação;</p><p>A necessidade de assessoria especializada para estruturar o projeto, formalizar a adesão, acompanhar o cumprimento das obrigações e orientar revisões periódicas;</p><p>O cuidado em harmonizar o COMPETE-ES com outros incentivos (por exemplo, programas de investimento e importação) para evitar sobreposição indevida ou conflito de regras.</p><p><br></p><h3><strong>8. Conclusão</strong></h3><p>O COMPETE-ES consolida-se como um dos mais relevantes instrumentos de incentivo fiscal do Espírito Santo, proporcionando redução significativa da carga de ICMS e aumento da competitividade das empresas que atuam a partir do Estado, especialmente em operações interestaduais de atacado e comércio eletrônico.</p><p><br></p><p>Para empresas com perfil adequado, o programa pode representar:</p><p><br></p><p>Economia substancial de tributos em operações de circulação de mercadorias;</p><p>Ampliação de margem de lucro ou melhoria na competitividade de preços;</p><p>Fortalecimento da presença comercial em outros estados;</p><p>Segurança jurídica na fruição do benefício, desde que atendidas todas as exigências legais e contratuais.</p><p>Por outro lado, a adesão exige planejamento, controles robustos e acompanhamento técnico constante, a fim de garantir o pleno aproveitamento do benefício e mitigar riscos fiscais. Por isso, é recomendável que as empresas interessadas realizem um estudo tributário detalhado e contem com uma assessoria especializada para conduzir todas as etapas de enquadramento e manutenção do COMPETE-ES.</p>', '', '/uploads/ca3ed6ea-04e4-4b11-987c-8bf532f4cab2.jpg', 1, true, '2025-11-21 14:12:49.534', '2025-11-28 14:58:01.356');
INSERT INTO public.section_fiscal_benefits VALUES ('benefit-4', 'Building2', 'Compete-Importação', 'Incentivos para empresas que realizam importações.', 'compete-importacao', '', NULL, NULL, 4, true, '2025-11-21 14:12:49.534', '2025-11-21 19:03:27.796');
INSERT INTO public.section_fiscal_benefits VALUES ('02d1525f-f99b-4016-ba1a-66cbc7ccf5a8', 'Factory', 'Invest-Indústria', 'Incentivos fiscais específicos para o setor industrial no Espírito Santo.', 'invest-industria', '<h2>O que é o Invest-Indústria?</h2>
<p>O Invest-Indústria é um programa de incentivo fiscal específico para empresas do setor industrial, oferecendo benefícios tributários para indústrias que operam no Espírito Santo.</p>

<h2>Principais Benefícios</h2>
<ul>
  <li>Redução de ICMS para operações industriais</li>
  <li>Benefícios sobre insumos e matérias-primas</li>
  <li>Créditos fiscais para aquisição de equipamentos</li>
  <li>Diferimento de ICMS em operações de entrada</li>
  <li>Simplificação de processos fiscais</li>
  <li>Incentivos para modernização industrial</li>
</ul>

<h2>Quem pode se beneficiar?</h2>
<p>Empresas do setor industrial que operam no Espírito Santo, especialmente aquelas que realizam transformação de matérias-primas, fabricação de produtos e geram empregos no estado.</p>

<h2>Requisitos</h2>
<ul>
  <li>Atividade industrial comprovada</li>
  <li>Investimento em modernização ou expansão</li>
  <li>Geração de empregos diretos</li>
  <li>Regularidade fiscal e trabalhista</li>
  <li>Enquadramento no CNAE industrial</li>
</ul>

<h2>Benefícios Específicos</h2>
<p>O programa oferece benefícios específicos para aquisição de máquinas, equipamentos e insumos utilizados no processo produtivo, reduzindo significativamente a carga tributária das empresas industriais.</p>', 'Programa de incentivo fiscal específico para empresas do setor industrial, oferecendo redução de ICMS e benefícios sobre insumos e matérias-primas.', NULL, 6, true, '2025-11-21 19:23:03.341', '2025-11-21 19:23:03.341');
INSERT INTO public.section_fiscal_benefits VALUES ('e2d936c7-3452-4a42-9aec-198958698036', 'TrendingDown', 'Invest-ES', 'Programa de incentivo para novos investimentos no Espírito Santo, oferecendo benefícios fiscais para empresas que investem no estado.', 'invest-es', '<h2>O que é o Invest-ES?</h2>
<p>O Invest-ES (Programa de Incentivo ao Investimento no Estado do Espírito Santo) é um programa de incentivo fiscal voltado para a implantação, expansão e modernização de empresas no estado, especialmente no setor industrial.</p>

<h2>Principais Benefícios</h2>
<ul>
  <li>Diferimento do ICMS para aquisição de equipamentos e máquinas</li>
  <li>Isenção de ICMS em operações específicas</li>
  <li>Crédito presumido de ICMS</li>
  <li>Redução da base de cálculo do ICMS</li>
  <li>Estorno de débito de ICMS</li>
  <li>Benefícios para investimentos produtivos</li>
</ul>

<h2>Quem pode se beneficiar?</h2>
<p>Empresas que realizam novos investimentos no Espírito Santo, especialmente nos setores de indústria, tecnologia e serviços especializados, que atendam aos critérios de geração de empregos e investimento mínimo estabelecidos pelo programa.</p>

<h2>Requisitos para Adesão</h2>
<ul>
  <li>Investimento mínimo conforme estabelecido pelo programa</li>
  <li>Geração de empregos diretos no estado</li>
  <li>Regularidade fiscal e trabalhista</li>
  <li>Enquadramento em setores prioritários</li>
  <li>Projeto de investimento aprovado</li>
</ul>

<h2>Como funciona?</h2>
<p>O benefício é concedido mediante assinatura de Termo de Compromisso com o Governo do Estado, onde a empresa se compromete a realizar investimentos e gerar empregos em troca dos benefícios fiscais oferecidos pelo programa.</p>

<h2>Setores Prioritários</h2>
<p>O programa prioriza investimentos em setores estratégicos como indústria de transformação, tecnologia, logística, energia e infraestrutura, contribuindo para o desenvolvimento econômico sustentável do estado.</p>', 'Programa de incentivo fiscal que oferece diferimento, isenção, crédito presumido e redução de base de cálculo do ICMS para empresas que realizam investimentos produtivos no Espírito Santo.', NULL, 5, true, '2025-11-21 19:23:03.332', '2025-11-21 19:23:03.332');
INSERT INTO public.section_fiscal_benefits VALUES ('824ffdcc-619d-484a-b0f5-cf6e5620e605', 'Users', 'Contribuinte Substituto', 'Regime especial de tributação para empresas qualificadas como contribuinte substituto no Espírito Santo.', 'contribuinte-substituto', '<h2>O que é Contribuinte Substituto?</h2>
<p>O regime de Contribuinte Substituto permite que empresas qualificadas assumam a responsabilidade pelo recolhimento de ICMS nas operações, oferecendo benefícios fiscais e simplificação de processos tributários.</p>

<h2>Principais Benefícios</h2>
<ul>
  <li>Simplificação de processos fiscais</li>
  <li>Redução de obrigações acessórias</li>
  <li>Benefícios tributários específicos</li>
  <li>Maior controle sobre a cadeia de fornecimento</li>
  <li>Eliminação da necessidade de antecipação do ICMS-ST</li>
  <li>Otimização do fluxo de caixa</li>
</ul>

<h2>Quem pode se beneficiar?</h2>
<p>Empresas que atendem aos critérios para se qualificar como contribuinte substituto, geralmente empresas de grande porte com operações significativas no estado, especialmente aquelas que comercializam produtos sujeitos à Substituição Tributária (ICMS-ST).</p>

<h2>Requisitos para Credenciamento</h2>
<ul>
  <li>Inscrição estadual no Espírito Santo</li>
  <li>Regularidade fiscal e trabalhista</li>
  <li>Atendimento aos critérios estabelecidos pela SEFAZ-ES</li>
  <li>Envio mensal da GIA-ST (Guia de Informações e Apuração - Substituição Tributária)</li>
  <li>Comercialização de produtos sujeitos à ST</li>
</ul>

<h2>Como funciona?</h2>
<p>Empresas credenciadas como contribuintes substitutos podem adquirir mercadorias sem o acréscimo do ICMS-ST, assumindo a responsabilidade pelo recolhimento do imposto nas operações subsequentes. Isso otimiza o fluxo de caixa e simplifica os processos tributários.</p>

<h2>Regime Especial de Obrigação Acessória (REOA)</h2>
<p>O REOA é essencial para empresas que atuam como contribuintes substitutos, permitindo a aquisição de mercadorias sem a antecipação do ICMS-ST, o que resulta em significativa economia de capital de giro.</p>', 'Regime especial que permite que empresas qualificadas assumam a responsabilidade pelo recolhimento de ICMS, oferecendo benefícios fiscais e simplificação de processos.', NULL, 7, true, '2025-11-21 19:23:03.346', '2025-11-21 19:23:03.346');


--
-- Data for Name: section_fun_facts; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.section_fun_facts VALUES ('funfact-2', 'Briefcase', 'Anos de Experiência', '36', '+', 2, true, '2025-11-21 14:12:49.577', '2025-11-24 19:24:36.14');
INSERT INTO public.section_fun_facts VALUES ('funfact-1', 'Users', 'Clientes Atendidos', '500', '+', 1, true, '2025-11-21 14:12:49.577', '2025-11-21 14:12:49.577');
INSERT INTO public.section_fun_facts VALUES ('funfact-4', 'Trophy', 'Prêmios Recebidos', '15', '+', 4, true, '2025-11-21 14:12:49.577', '2025-11-21 14:12:49.577');
INSERT INTO public.section_fun_facts VALUES ('funfact-3', 'Coffee', 'Xícaras de Café', '840', '+', 3, true, '2025-11-21 14:12:49.577', '2025-11-24 10:52:24.725');


--
-- Data for Name: section_newsletter; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.section_newsletter VALUES ('7ea139b8-5e89-477d-b6bc-c3b13e75dc5e', 'Fique por dentro das novidades', 'Receba atualizações e dicas exclusivas', 'Inscreva-se em nossa newsletter e receba conteúdo exclusivo sobre contabilidade, gestão empresarial e novidades fiscais.', 'Inscrever-se', NULL, '2025-12-02 17:41:53.946');
INSERT INTO public.section_newsletter VALUES ('3f55ff40-4780-4443-b005-b237bdc32d2c', 'Fique por dentro das novidades', 'Receba atualizações e dicas exclusivas', 'Inscreva-se em nossa newsletter e receba conteúdo exclusivo sobre contabilidade, gestão empresarial e novidades fiscais.', 'Inscrever-se', NULL, '2025-11-21 14:12:49.661');


--
-- Data for Name: section_services; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.section_services VALUES ('c42a4da1-0e5c-4e30-a7cc-b1457c85b2a7', 'Nossos Serviços', 'Nossas Soluções Vão', 'Além da Contabilidade', 'Atuamos de forma integrada e estratégica para que o seu negócio tenha a melhor performance contábil, fiscal e tributária com 34 anos de experiência.', NULL, NULL, '2025-12-05 16:38:13.477', '2025-12-05 16:38:20.888');
INSERT INTO public.section_services VALUES ('54d2a1ec-0e0e-4b64-89a2-ae8c2bfebc54', 'Nossos Serviços', 'Nossas Soluções Vão', 'Além da Contabilidade', 'Atuamos de forma integrada e estratégica para que o seu negócio tenha a melhor performance contábil, fiscal e tributária com 34 anos de experiência.', '34', NULL, '2025-12-05 16:38:13.483', '2025-12-05 16:38:13.483');


--
-- Data for Name: section_specialties; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.section_specialties VALUES ('specialty-1', 'Store', 'Contabilidade Atacadista', 'Especialização em contabilidade para empresas do setor atacadista, com conhecimento profundo das particularidades fiscais e tributárias do segmento.', 1, true, '2025-11-21 14:12:49.504', '2025-11-21 14:12:49.504');
INSERT INTO public.section_specialties VALUES ('specialty-3', 'ShoppingCart', 'Contabilidade E-Commerce', 'Especialização em contabilidade para empresas de e-commerce, com foco em compliance fiscal, tributação de vendas online e otimização tributária.', 3, true, '2025-11-21 14:12:49.504', '2025-11-21 14:12:49.504');
INSERT INTO public.section_specialties VALUES ('specialty-2', 'TrendingUp', 'Planejamento Tributário', 'A sua empresa pode estar pagando mais impostos do que deveria. Por meio de um Planejamento Tributário é possível reduzir custos e aumentar o rendimento do seu negócio!', 2, true, '2025-11-21 14:12:49.504', '2025-11-21 14:12:49.504');


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.services VALUES ('service-5', 'Legalização de Empresas', 'legalizacao-de-empresas', 'Regularização de empresas com pendências fiscais e trabalhistas junto aos órgãos competentes. Recupere a saúde do seu negócio.', '<p>Regularização completa de empresas com pendências fiscais e trabalhistas junto aos órgãos competentes.</p><p>Recupere a saúde do seu negócio com nosso suporte especializado.</p>', 'shield', '/uploads/f4ff5c99-2df3-4d6b-99a5-01f827ad205c.jpg', 5, true, '2025-11-21 14:12:49.21', '2025-11-26 21:43:10.703');
INSERT INTO public.services VALUES ('service-6', 'Assessoria Financeira', 'assessoria-financeira', 'Análise de demonstrativos financeiros e orientação para melhoria da saúde financeira. Tomar decisões baseadas em dados.', '<p>Análise detalhada de demonstrativos financeiros e orientação estratégica para melhoria da saúde financeira.</p><p>Tomamos decisões baseadas em dados concretos e análises precisas.</p>', 'trending-up', '/uploads/8380d409-d292-49df-a9a0-53d63baf81a7.jpg', 6, true, '2025-11-21 14:12:49.21', '2025-11-26 21:43:17.337');
INSERT INTO public.services VALUES ('service-4', 'Fiscal e Tributária', 'fiscal-e-tributaria', 'Planejamento tributário, elaboração de guias e cumprimento de obrigações fiscais. Reduza custos dentro da legalidade.', '<p>Planejamento tributário estratégico, elaboração de guias e cumprimento de todas as obrigações fiscais.</p><p>Reduza custos tributários dentro da legalidade, otimizando a carga fiscal da sua empresa.</p>', 'file-text', '/uploads/cb19a293-5e82-497f-83b3-c6eab4b23d59.png', 4, true, '2025-11-21 14:12:49.21', '2025-11-26 21:44:21.716');
INSERT INTO public.services VALUES ('service-3', 'Departamento Pessoal', 'departamento-pessoal', 'Gestão completa de folha de pagamento, admissões, demissões e obrigações trabalhistas. Garantia de conformidade com a legislação.', '<p>Gestão completa de folha de pagamento, admissões, demissões e todas as obrigações trabalhistas.</p><p>Garantimos total conformidade com a legislação trabalhista vigente.</p>', 'users', '/uploads/032f3ceb-7233-4e6c-9721-4a14a35fd5e3.jpg', 1, true, '2025-11-21 14:12:49.21', '2025-11-26 21:41:43.731');
INSERT INTO public.services VALUES ('service-1', 'Abertura de Empresa', 'abertura-de-empresa', 'Assessoria completa para abertura de CNPJ, escolha do regime tributário e legalização do seu negócio. Cuidamos de todo o processo burocrático para você.', '<p>Nossa equipe especializada oferece uma assessoria completa para abertura de empresa, desde a escolha do melhor regime tributário até a legalização completa do seu negócio.</p><p>Oferecemos suporte em todas as etapas do processo, garantindo agilidade e segurança na abertura da sua empresa.</p>', 'building', '/uploads/c5dc8d9a-d7a5-4915-ae54-763b8a8c9bcd.jpg', 2, true, '2025-11-21 14:12:49.21', '2025-11-26 21:42:45.996');
INSERT INTO public.services VALUES ('service-2', 'Contabilidade Consultiva', 'contabilidade-consultiva', 'Serviços contábeis com análise detalhada e orientação estratégica para crescimento do seu negócio. Transforme dados em decisões inteligentes.', '<p>A contabilidade consultiva vai além dos números. Oferecemos análise detalhada e orientação estratégica para o crescimento sustentável do seu negócio.</p><p>Transformamos dados contábeis em insights valiosos para tomada de decisão.</p>', 'calculator', '/uploads/99b2b2fd-deb3-433c-b029-554460151a70.webp', 3, true, '2025-11-21 14:12:49.21', '2025-11-26 21:42:52.426');


--
-- Data for Name: slides; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.slides VALUES ('slide-1', 'Soluções Contábeis Personalizadas', 'Especialistas em contabilidade para pequenas e médias empresas', 'https://images.unsplash.com/photo-1554224155-6726b468ff31?w=1200&h=800&fit=crop', 'Saiba Mais', '#servicos', 1, true, '2025-11-21 14:12:49.175', '2025-11-21 14:12:49.175');
INSERT INTO public.slides VALUES ('slide-3', 'Abertura de Empresa Simplificada', 'Comece seu negócio com toda assessoria contábil necessária', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop', 'Solicite um Orçamento', '#contato', 3, true, '2025-11-21 14:12:49.175', '2025-11-21 14:12:49.175');
INSERT INTO public.slides VALUES ('slide-2', 'Assessoria Tributária Especializada', 'Minimize seus custos com planejamento tributário inteligente', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop', 'Entre em Contato', '#contato', 2, true, '2025-11-21 14:12:49.175', '2025-11-21 14:12:49.175');


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: central_rnc_user
--

INSERT INTO public.testimonials VALUES ('testimonial-2', 'Maria Santos', 'Comércio Varejista Ltda', 'Estou muito satisfeita com os serviços prestados. A assessoria tributária fez toda a diferença para o crescimento do meu negócio. Profissionais excelentes!', NULL, 'image', NULL, 2, true, '2025-11-21 14:12:49.305', '2025-11-21 14:12:49.305');
INSERT INTO public.testimonials VALUES ('testimonial-3', 'Pedro Oliveira', 'Tecnologia Inovadora', 'Profissionais extremamente competentes. Sempre disponíveis para tirar dúvidas e oferecer as melhores soluções contábeis. São parceiros fundamentais para nossa empresa.', NULL, 'image', NULL, 3, true, '2025-11-21 14:12:49.305', '2025-11-21 14:12:49.305');
INSERT INTO public.testimonials VALUES ('testimonial-1', 'João Silva', 'Silva & Associados', 'Excelente serviço! A equipe é muito profissional e atenciosa. Nos ajudou a organizar toda a contabilidade da empresa com muita eficiência. Super recomendo!', NULL, 'image', NULL, 1, true, '2025-11-21 14:12:49.305', '2025-11-21 14:12:49.305');


--
-- PostgreSQL database dump complete
--

\unrestrict Wava0juYmJFAEo7J7000acgqdNlyOOVcIvP1EkFHgD3dzJ9DH92U6eyKdzE506F

