DROP TABLE search_question_selector;
DROP TABLE search_selector;
DROP TABLE search_question;
DROP TABLE search_profile;

CREATE TABLE search_profile(
    id varchar(50) NOT NULL,
    name_pt varchar (50) NULL,
    name_en varchar (50) NULL,
    PRIMARY KEY (id)
);

CREATE TABLE search_question(
    id int UNSIGNED NOT NULL AUTO_INCREMENT,
    description_pt varchar (400) NULL,
    description_en varchar (400) NULL,
    answer varchar (400) NULL,
    profile_id varchar(50) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (profile_id) REFERENCES search_profile(id)
);

CREATE TABLE search_selector(
    id varchar(50) NOT NULL,
    name_pt varchar (50) NULL,
    name_en varchar (50) NULL,
    PRIMARY KEY (id)
);

CREATE TABLE search_question_selector(
    question_id int UNSIGNED NOT NULL,
    selector_id varchar(50) NOT NULL,
    `order` int NOT NULL,
    PRIMARY KEY (`question_id`, `selector_id`),
    FOREIGN KEY (question_id) REFERENCES search_question(id),
    FOREIGN KEY (selector_id) REFERENCES search_selector(id)
);

INSERT INTO search_profile (id, name_en, name_pt) VALUES ('entrepreneurs', 'Entrepreneurs', 'Empreendedores');
INSERT INTO search_profile (id, name_en, name_pt) VALUES ('development_agents', 'Development Agents', 'Agentes de Desenvolvimento');
INSERT INTO search_profile (id, name_en, name_pt) VALUES ('students', 'Students and Professionals', 'Estudantes e Profissionais');

INSERT INTO search_selector (id, name_pt, name_en) VALUES ('bra', 'Locations', 'Localidades');
INSERT INTO search_selector (id, name_pt, name_en) VALUES ('cbo', 'Occupations', 'Ocupações');
INSERT INTO search_selector (id, name_pt, name_en) VALUES ('cnae', 'Industries', 'Atividades Econômicas');
INSERT INTO search_selector (id, name_pt, name_en) VALUES ('hs', 'Products', 'Produtos');
INSERT INTO search_selector (id, name_pt, name_en) VALUES ('wld', 'Trade partners', 'Parceiro Comerciais');
INSERT INTO search_selector (id, name_pt, name_en) VALUES ('university', 'Universities', 'Universidades');
INSERT INTO search_selector (id, name_pt, name_en) VALUES ('course_hedu', 'Major', 'Ensino Superior');
INSERT INTO search_selector (id, name_pt, name_en) VALUES ('course_sc', 'Basic course', 'Curso Básico');

INSERT INTO search_question (profile_id, description_pt, description_en, answer) VALUES
((SELECT id FROM search_profile where name_en = 'Entrepreneurs'),
'Qual o número de estabelecimentos na Atividade X, na Localidade Y?',
'How many establishments in activity X are there in location Y?',
'/industry/%s?bra_id=%s'),

((SELECT id FROM search_profile where name_en = 'Entrepreneurs'),
'Qual o salário médio da Atividade X, na Localidade Y?',
'What is the average wage of activity X in location Y?',
'/industry/%s?bra_id=%s'),

((SELECT id FROM search_profile where name_en = 'Entrepreneurs'),
'Qual o salário médio da Ocupação Z, na Atividade X, na Localidade Y?',
'What is the average wage of occupation Z in activity X in location Y?',
'/occupation/%s?cnae_id=%s?bra_id=%s'),

((SELECT id FROM search_profile where name_en = 'Entrepreneurs'),
'Quais os principais parceiros comerciais de um Produto P na Localidade Y?',
'Which are the main business partners of product P in location Y?',
'/product/%s?bra_id=%s'),

((SELECT id FROM search_profile where name_en = 'Entrepreneurs'),
'Quais localidades concentram o emprego na Atividade X?',
'Which places concentrate jobs in activity X?',
'/industry/%s'),

((SELECT id FROM search_profile where name_en = 'Entrepreneurs'),
'Quais as localidades que mais importam o Produto P?',
'Which places are the top importers of product P?',
'/product/%s'),

((SELECT id FROM search_profile where name_en = 'Entrepreneurs'),
'Quais as localidades que mais exportam o Produto P?',
'Which places are the top exporters of product P?',
'/product/%s'),

((SELECT id FROM search_profile where name_en = 'Entrepreneurs'),
'Quais os produtos mais próximos da estrutura produtiva da Localidade Y?',
'Which products are closer to the productive structure of location y?',
'/location/%s'),

((SELECT id FROM search_profile where name_en = 'Entrepreneurs'),
'Quais os cursos de nível superior oferecidos na Localidade Y?',
'Which post-secondary courses are offered in location Y?',
'/location/%s'),

((SELECT id FROM search_profile where name_en = 'Entrepreneurs'),
'Quais os cursos de nível técnico oferecidos na Localida de Y?',
'Which technical courses are offered in location Y?',
'/location/%s');

INSERT INTO search_question (profile_id, description_pt, description_en, answer) VALUES
((SELECT id FROM search_profile where name_en = 'Development Agents'),
'Qual a rede de produtos da Localidade Y?',
'What is the product network of location Y?',
'/location/%s'),

((SELECT id FROM search_profile where name_en = 'Development Agents'),
'Quais os produtos mais próximos da estrutura produtiva da Localidade Y?',
'Which products are closer to the productive structure of location Y?',
'/location/%s'),

((SELECT id FROM search_profile where name_en = 'Development Agents'),
'Quais os produtos de maior complexidade exportados por uma Localidade Y?',
'Which are the most complex products exported by location Y?',
'/location/%s'),

((SELECT id FROM search_profile where name_en = 'Development Agents'),
'Quais os produtos de maior complexidade importados por uma Localidade Y?',
'Which are the most complex products imported by location Y?',
'/location/%s'),

((SELECT id FROM search_profile where name_en = 'Development Agents'),
'Qual a rede de atividades da Localidade Y?',
'What is the activity network of location Y?',
'/location/%s'),

((SELECT id FROM search_profile where name_en = 'Development Agents'),
'Quais as atividades mais próximas da estrutura produtiva da Localidade Y?',
'Which activities are closer to the productive structure of location Y?',
'/location/%s'),

((SELECT id FROM search_profile where name_en = 'Development Agents'),
'Quais localidades concentram o emprego na Atividade X?',
'Which places concentrate the jobs in activity X?',
'/industry/%s');

INSERT INTO search_question (profile_id, description_pt, description_en, answer) VALUES
((SELECT id FROM search_profile where name_en = 'Students and Professionals'),
'Quais os cursos de nível superior oferecidos na Localidade Y?',
'Which post-secondary courses are offered in location Y?',
'/location/%s'),

((SELECT id FROM search_profile where name_en = 'Students and Professionals'),
'Quais os cursos de nível técnico oferecidos na Localidade Y?',
'Which technical courses are offered in location Y?',
'/location/%s'),

((SELECT id FROM search_profile where name_en = 'Students and Professionals'),
'Qual o salário médio da Ocupação Z na Localidade Y?',
'What is the average wage of occupation Z in location Y?',
'/occupation/%s?bra_id=%s'),

((SELECT id FROM search_profile where name_en = 'Students and Professionals'),
'Em quais localidades paga-se o maior salário médio da Ocupação Z?',
'Which places pay the highest average wage for occupation Z?',
'/occupation/%s'),

((SELECT id FROM search_profile where name_en = 'Students and Professionals'),
'Em quais localidades cresce o número de empregados da Ocupação Z?',
'Which places are increasing the number of workers in occupation Z?',
'/occupation/%s'),

((SELECT id FROM search_profile where name_en = 'Students and Professionals'),
'Quais os principais produtos exportados pela Localidade Y?',
'Which are the main products imported by location Y?',
'/location/%s'),

((SELECT id FROM search_profile where name_en = 'Students and Professionals'),
'Quais as principais atividades econômicas de uma Localidade Y?',
'Which are the main products exported by location Y?',
'/location/%s');

INSERT INTO search_question_selector (question_id, selector_id, `order`) VALUES
((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Entrepreneurs')
   AND description_pt = 'Qual o número de estabelecimentos na Atividade X, na Localidade Y?'),
'cnae', 0),
((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Entrepreneurs')
   AND description_pt = 'Qual o número de estabelecimentos na Atividade X, na Localidade Y?'),
'bra', 1),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Entrepreneurs')
   AND description_pt = 'Qual o salário médio da Atividade X, na Localidade Y?'),
'cnae', 0),
((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Entrepreneurs')
   AND description_pt = 'Qual o salário médio da Atividade X, na Localidade Y?'),
'bra', 1),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Entrepreneurs')
   AND description_pt = 'Qual o salário médio da Ocupação Z, na Atividade X, na Localidade Y?'),
'cbo', 0),
((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Entrepreneurs')
   AND description_pt = 'Qual o salário médio da Ocupação Z, na Atividade X, na Localidade Y?'),
'cnae', 1),
((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Entrepreneurs')
   AND description_pt = 'Qual o salário médio da Ocupação Z, na Atividade X, na Localidade Y?'),
'bra', 2),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Entrepreneurs')
   AND description_pt = 'Quais os principais parceiros comerciais de um Produto P na Localidade Y?'),
'hs', 0),
((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Entrepreneurs')
   AND description_pt = 'Quais os principais parceiros comerciais de um Produto P na Localidade Y?'),
'bra', 1),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Entrepreneurs')
   AND description_pt = 'Quais localidades concentram o emprego na Atividade X?'),
'cnae', 0),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Entrepreneurs')
   AND description_pt = 'Quais as localidades que mais importam o Produto P?'),
'hs', 0),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Entrepreneurs')
   AND description_pt = 'Quais as localidades que mais exportam o Produto P?'),
'hs', 0),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Entrepreneurs')
   AND description_pt = 'Quais os produtos mais próximos da estrutura produtiva da Localidade Y?'),
'bra', 0),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Entrepreneurs')
   AND description_pt = 'Quais os cursos de nível superior oferecidos na Localidade Y?'),
'bra', 0),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Entrepreneurs')
   AND description_pt = 'Quais os cursos de nível técnico oferecidos na Localida de Y?'),
'bra', 0);


INSERT INTO search_question_selector (question_id, selector_id, `order`) VALUES
((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Development Agents')
   AND description_pt = 'Qual a rede de produtos da Localidade Y?'),
'bra', 0),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Development Agents')
   AND description_pt = 'Quais os produtos mais próximos da estrutura produtiva da Localidade Y?'),
'bra', 0),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Development Agents')
   AND description_pt = 'Quais os produtos de maior complexidade exportados por uma Localidade Y?'),
'bra', 0),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Development Agents')
   AND description_pt = 'Quais os produtos de maior complexidade importados por uma Localidade Y?'),
'bra', 0),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Development Agents')
   AND description_pt = 'Qual a rede de atividades da Localidade Y?'),
'bra', 0),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Development Agents')
   AND description_pt = 'Quais as atividades mais próximas da estrutura produtiva da Localidade Y?'),
'bra', 0),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Development Agents')
   AND description_pt = 'Quais localidades concentram o emprego na Atividade X?'),
'cnae', 0);


INSERT INTO search_question_selector (question_id, selector_id, `order`) VALUES
((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Students and Professionals')
   AND description_pt = 'Quais os cursos de nível superior oferecidos na Localidade Y?'),
'bra', 0),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Students and Professionals')
   AND description_pt = 'Quais os cursos de nível técnico oferecidos na Localidade Y?'),
'bra', 0),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Students and Professionals')
   AND description_pt = 'Qual o salário médio da Ocupação Z na Localidade Y?'),
'cbo', 0),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Students and Professionals')
   AND description_pt = 'Em quais localidades paga-se o maior salário médio da Ocupação Z?'),
'cbo', 0),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Students and Professionals')
   AND description_pt = 'Em quais localidades cresce o número de empregados da Ocupação Z?'),
'cbo', 0),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Students and Professionals')
   AND description_pt = 'Quais os principais produtos exportados pela Localidade Y?'),
'bra', 0),

((SELECT id FROM search_question WHERE profile_id = (SELECT id FROM search_profile where name_en = 'Students and Professionals')
   AND description_pt = 'Quais as principais atividades econômicas de uma Localidade Y?'),
'bra', 0);
