--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Ubuntu 16.4-0ubuntu0.24.04.2)
-- Dumped by pg_dump version 16.4 (Ubuntu 16.4-0ubuntu0.24.04.2)

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
-- Name: log_acces(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_acces() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO journal_acces (utilisateur, action, table_name)
    VALUES (current_user, TG_OP, TG_TABLE_NAME);
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_acces() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alerte; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alerte (
    id integer NOT NULL,
    datecreation timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type character varying(50) NOT NULL,
    description text NOT NULL,
    niveauurgence integer NOT NULL,
    patient_id integer,
    CONSTRAINT alerte_niveauurgence_check CHECK (((niveauurgence >= 1) AND (niveauurgence <= 5)))
);


ALTER TABLE public.alerte OWNER TO postgres;

--
-- Name: alerte_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alerte_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alerte_id_seq OWNER TO postgres;

--
-- Name: alerte_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alerte_id_seq OWNED BY public.alerte.id;


--
-- Name: cabinetmedical; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cabinetmedical (
    id integer NOT NULL,
    nom character varying(100) NOT NULL,
    adresse character varying(255) NOT NULL
);


ALTER TABLE public.cabinetmedical OWNER TO postgres;

--
-- Name: cabinetmedical_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cabinetmedical_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cabinetmedical_id_seq OWNER TO postgres;

--
-- Name: cabinetmedical_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cabinetmedical_id_seq OWNED BY public.cabinetmedical.id;


--
-- Name: compterendu; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compterendu (
    id integer NOT NULL,
    datecreation timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    contenu text NOT NULL,
    professionnel_id integer,
    dossier_id integer
);


ALTER TABLE public.compterendu OWNER TO postgres;

--
-- Name: compterendu_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.compterendu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.compterendu_id_seq OWNER TO postgres;

--
-- Name: compterendu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.compterendu_id_seq OWNED BY public.compterendu.id;


--
-- Name: dispositifmedical; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dispositifmedical (
    id integer NOT NULL,
    type character varying(100) NOT NULL,
    numeroserie character varying(50) NOT NULL,
    patient_id integer
);


ALTER TABLE public.dispositifmedical OWNER TO postgres;

--
-- Name: dispositifmedical_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dispositifmedical_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dispositifmedical_id_seq OWNER TO postgres;

--
-- Name: dispositifmedical_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dispositifmedical_id_seq OWNED BY public.dispositifmedical.id;


--
-- Name: donneesdm; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.donneesdm (
    id integer NOT NULL,
    datemesure timestamp without time zone NOT NULL,
    tensionarterielle character varying(20),
    rythmecardiaque integer,
    oxymetrie integer,
    dispositif_id integer
);


ALTER TABLE public.donneesdm OWNER TO postgres;

--
-- Name: donneesdm_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.donneesdm_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.donneesdm_id_seq OWNER TO postgres;

--
-- Name: donneesdm_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.donneesdm_id_seq OWNED BY public.donneesdm.id;


--
-- Name: dossierpatient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dossierpatient (
    id integer NOT NULL,
    datecreation date DEFAULT CURRENT_DATE NOT NULL,
    patient_id integer
);


ALTER TABLE public.dossierpatient OWNER TO postgres;

--
-- Name: dossierpatient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dossierpatient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dossierpatient_id_seq OWNER TO postgres;

--
-- Name: dossierpatient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dossierpatient_id_seq OWNED BY public.dossierpatient.id;


--
-- Name: journal_acces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_acces (
    id integer NOT NULL,
    utilisateur character varying(50),
    action character varying(50),
    table_name character varying(50),
    date_acces timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.journal_acces OWNER TO postgres;

--
-- Name: journal_acces_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.journal_acces_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.journal_acces_id_seq OWNER TO postgres;

--
-- Name: journal_acces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.journal_acces_id_seq OWNED BY public.journal_acces.id;


--
-- Name: patient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient (
    id integer NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    datenaissance date NOT NULL,
    numerosecu character varying(15) NOT NULL
);


ALTER TABLE public.patient OWNER TO postgres;

--
-- Name: patient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patient_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patient_id_seq OWNER TO postgres;

--
-- Name: patient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patient_id_seq OWNED BY public.patient.id;


--
-- Name: professionnelsante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.professionnelsante (
    id integer NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    type character varying(50) NOT NULL,
    numerorpps character varying(50) NOT NULL,
    cabinet_id integer
);


ALTER TABLE public.professionnelsante OWNER TO postgres;

--
-- Name: professionnelsante_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.professionnelsante_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.professionnelsante_id_seq OWNER TO postgres;

--
-- Name: professionnelsante_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.professionnelsante_id_seq OWNED BY public.professionnelsante.id;


--
-- Name: vue_patient_base; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vue_patient_base AS
 SELECT id,
    nom,
    prenom,
    datenaissance
   FROM public.patient;


ALTER VIEW public.vue_patient_base OWNER TO postgres;

--
-- Name: alerte id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerte ALTER COLUMN id SET DEFAULT nextval('public.alerte_id_seq'::regclass);


--
-- Name: cabinetmedical id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cabinetmedical ALTER COLUMN id SET DEFAULT nextval('public.cabinetmedical_id_seq'::regclass);


--
-- Name: compterendu id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compterendu ALTER COLUMN id SET DEFAULT nextval('public.compterendu_id_seq'::regclass);


--
-- Name: dispositifmedical id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositifmedical ALTER COLUMN id SET DEFAULT nextval('public.dispositifmedical_id_seq'::regclass);


--
-- Name: donneesdm id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donneesdm ALTER COLUMN id SET DEFAULT nextval('public.donneesdm_id_seq'::regclass);


--
-- Name: dossierpatient id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dossierpatient ALTER COLUMN id SET DEFAULT nextval('public.dossierpatient_id_seq'::regclass);


--
-- Name: journal_acces id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_acces ALTER COLUMN id SET DEFAULT nextval('public.journal_acces_id_seq'::regclass);


--
-- Name: patient id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient ALTER COLUMN id SET DEFAULT nextval('public.patient_id_seq'::regclass);


--
-- Name: professionnelsante id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professionnelsante ALTER COLUMN id SET DEFAULT nextval('public.professionnelsante_id_seq'::regclass);


--
-- Data for Name: alerte; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alerte (id, datecreation, type, description, niveauurgence, patient_id) FROM stdin;
\.


--
-- Data for Name: cabinetmedical; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cabinetmedical (id, nom, adresse) FROM stdin;
\.


--
-- Data for Name: compterendu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.compterendu (id, datecreation, contenu, professionnel_id, dossier_id) FROM stdin;
\.


--
-- Data for Name: dispositifmedical; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispositifmedical (id, type, numeroserie, patient_id) FROM stdin;
\.


--
-- Data for Name: donneesdm; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.donneesdm (id, datemesure, tensionarterielle, rythmecardiaque, oxymetrie, dispositif_id) FROM stdin;
\.


--
-- Data for Name: dossierpatient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dossierpatient (id, datecreation, patient_id) FROM stdin;
\.


--
-- Data for Name: journal_acces; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal_acces (id, utilisateur, action, table_name, date_acces) FROM stdin;
\.


--
-- Data for Name: patient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient (id, nom, prenom, datenaissance, numerosecu) FROM stdin;
\.


--
-- Data for Name: professionnelsante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.professionnelsante (id, nom, prenom, type, numerorpps, cabinet_id) FROM stdin;
\.


--
-- Name: alerte_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alerte_id_seq', 1, false);


--
-- Name: cabinetmedical_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cabinetmedical_id_seq', 1, false);


--
-- Name: compterendu_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.compterendu_id_seq', 1, false);


--
-- Name: dispositifmedical_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dispositifmedical_id_seq', 1, false);


--
-- Name: donneesdm_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.donneesdm_id_seq', 1, false);


--
-- Name: dossierpatient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dossierpatient_id_seq', 1, false);


--
-- Name: journal_acces_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.journal_acces_id_seq', 1, false);


--
-- Name: patient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patient_id_seq', 1, false);


--
-- Name: professionnelsante_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.professionnelsante_id_seq', 1, false);


--
-- Name: alerte alerte_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerte
    ADD CONSTRAINT alerte_pkey PRIMARY KEY (id);


--
-- Name: cabinetmedical cabinetmedical_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cabinetmedical
    ADD CONSTRAINT cabinetmedical_pkey PRIMARY KEY (id);


--
-- Name: compterendu compterendu_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compterendu
    ADD CONSTRAINT compterendu_pkey PRIMARY KEY (id);


--
-- Name: dispositifmedical dispositifmedical_numeroserie_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositifmedical
    ADD CONSTRAINT dispositifmedical_numeroserie_key UNIQUE (numeroserie);


--
-- Name: dispositifmedical dispositifmedical_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositifmedical
    ADD CONSTRAINT dispositifmedical_pkey PRIMARY KEY (id);


--
-- Name: donneesdm donneesdm_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donneesdm
    ADD CONSTRAINT donneesdm_pkey PRIMARY KEY (id);


--
-- Name: dossierpatient dossierpatient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dossierpatient
    ADD CONSTRAINT dossierpatient_pkey PRIMARY KEY (id);


--
-- Name: journal_acces journal_acces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_acces
    ADD CONSTRAINT journal_acces_pkey PRIMARY KEY (id);


--
-- Name: patient patient_numerosecu_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT patient_numerosecu_key UNIQUE (numerosecu);


--
-- Name: patient patient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient
    ADD CONSTRAINT patient_pkey PRIMARY KEY (id);


--
-- Name: professionnelsante professionnelsante_numerorpps_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professionnelsante
    ADD CONSTRAINT professionnelsante_numerorpps_key UNIQUE (numerorpps);


--
-- Name: professionnelsante professionnelsante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professionnelsante
    ADD CONSTRAINT professionnelsante_pkey PRIMARY KEY (id);


--
-- Name: donneesdm log_donnees_acces; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_donnees_acces AFTER INSERT OR DELETE OR UPDATE ON public.donneesdm FOR EACH ROW EXECUTE FUNCTION public.log_acces();


--
-- Name: patient log_patient_acces; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_patient_acces AFTER INSERT OR DELETE OR UPDATE ON public.patient FOR EACH ROW EXECUTE FUNCTION public.log_acces();


--
-- Name: alerte alerte_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerte
    ADD CONSTRAINT alerte_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient(id);


--
-- Name: compterendu compterendu_dossier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compterendu
    ADD CONSTRAINT compterendu_dossier_id_fkey FOREIGN KEY (dossier_id) REFERENCES public.dossierpatient(id);


--
-- Name: compterendu compterendu_professionnel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compterendu
    ADD CONSTRAINT compterendu_professionnel_id_fkey FOREIGN KEY (professionnel_id) REFERENCES public.professionnelsante(id);


--
-- Name: dispositifmedical dispositifmedical_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositifmedical
    ADD CONSTRAINT dispositifmedical_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient(id);


--
-- Name: donneesdm donneesdm_dispositif_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donneesdm
    ADD CONSTRAINT donneesdm_dispositif_id_fkey FOREIGN KEY (dispositif_id) REFERENCES public.dispositifmedical(id);


--
-- Name: dossierpatient dossierpatient_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dossierpatient
    ADD CONSTRAINT dossierpatient_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patient(id);


--
-- Name: professionnelsante professionnelsante_cabinet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professionnelsante
    ADD CONSTRAINT professionnelsante_cabinet_id_fkey FOREIGN KEY (cabinet_id) REFERENCES public.cabinetmedical(id);


--
-- Name: alerte; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.alerte ENABLE ROW LEVEL SECURITY;

--
-- Name: compterendu; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.compterendu ENABLE ROW LEVEL SECURITY;

--
-- Name: donneesdm; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.donneesdm ENABLE ROW LEVEL SECURITY;

--
-- Name: dossierpatient; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.dossierpatient ENABLE ROW LEVEL SECURITY;

--
-- Name: donneesdm medecin_donnees_access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY medecin_donnees_access ON public.donneesdm FOR SELECT TO medecin USING ((dispositif_id IN ( SELECT dm.id
   FROM ((((public.dispositifmedical dm
     JOIN public.patient p ON ((p.id = dm.patient_id)))
     JOIN public.dossierpatient dp ON ((dp.patient_id = p.id)))
     JOIN public.compterendu cr ON ((cr.dossier_id = dp.id)))
     JOIN public.professionnelsante ps ON ((ps.id = cr.professionnel_id)))
  WHERE (ps.id = (CURRENT_USER)::integer))));


--
-- Name: patient medecin_patient_access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY medecin_patient_access ON public.patient TO medecin USING ((id IN ( SELECT p.id
   FROM (((public.patient p
     JOIN public.dossierpatient dp ON ((dp.patient_id = p.id)))
     JOIN public.compterendu cr ON ((cr.dossier_id = dp.id)))
     JOIN public.professionnelsante ps ON ((ps.id = cr.professionnel_id)))
  WHERE (ps.id = (CURRENT_USER)::integer))));


--
-- Name: patient; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.patient ENABLE ROW LEVEL SECURITY;

--
-- Name: TABLE alerte; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.alerte TO medecin;
GRANT SELECT,INSERT ON TABLE public.alerte TO infirmier;


--
-- Name: TABLE cabinetmedical; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.cabinetmedical TO secretaire;


--
-- Name: TABLE compterendu; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT ON TABLE public.compterendu TO medecin;


--
-- Name: TABLE dispositifmedical; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.dispositifmedical TO medecin;
GRANT SELECT ON TABLE public.dispositifmedical TO infirmier;


--
-- Name: TABLE donneesdm; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.donneesdm TO medecin;
GRANT SELECT,INSERT ON TABLE public.donneesdm TO infirmier;


--
-- Name: TABLE dossierpatient; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,UPDATE ON TABLE public.dossierpatient TO medecin;
GRANT SELECT ON TABLE public.dossierpatient TO infirmier;
GRANT SELECT ON TABLE public.dossierpatient TO secretaire;


--
-- Name: TABLE patient; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,UPDATE ON TABLE public.patient TO medecin;
GRANT SELECT ON TABLE public.patient TO infirmier;
GRANT SELECT,INSERT ON TABLE public.patient TO secretaire;


--
-- Name: TABLE vue_patient_base; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.vue_patient_base TO secretaire;


--
-- PostgreSQL database dump complete
--

