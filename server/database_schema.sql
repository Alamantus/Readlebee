--
-- PostgreSQL database dump
--

-- Dumped from database version 11.5
-- Dumped by pg_dump version 11.5

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

SET default_with_oids = false;

--
-- Name: shelf_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."shelf_items" (
    "bookid" character varying(128) NOT NULL,
    "shelf" integer NOT NULL,
    "position" integer,
    "added_timestamp" timestamp with time zone NOT NULL
);


--
-- Name: COLUMN "shelf_items"."bookid"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN "public"."shelf_items"."bookid" IS 'Concatenation of source and the source''s id for the book separated by two colons `::`';


--
-- Name: shelves; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."shelves" (
    "id" integer NOT NULL,
    "user" integer NOT NULL,
    "name" character varying(32) NOT NULL,
    "is_restricted" boolean
);


--
-- Name: COLUMN "shelves"."is_restricted"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN "public"."shelves"."is_restricted" IS 'If true, books on this shelf cannot be in other restricted shelves.';


--
-- Name: shelves_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."shelves_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shelves_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."shelves_id_seq" OWNED BY "public"."shelves"."id";


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."users" (
    "email" character varying(254) NOT NULL,
    "username" character varying(32) NOT NULL,
    "display_name" character varying(64),
    "pw_hash" character varying(512) NOT NULL,
    "id" integer NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."users_id_seq" OWNED BY "public"."users"."id";


--
-- Name: shelves id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."shelves" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."shelves_id_seq"'::"regclass");


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."users_id_seq"'::"regclass");


--
-- Name: shelves shelves_pkey_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."shelves"
    ADD CONSTRAINT "shelves_pkey_id" PRIMARY KEY ("id");


--
-- Name: users users_pkey_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey_id" PRIMARY KEY ("id");


--
-- Name: bookid_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "bookid_index" ON "public"."shelf_items" USING "btree" ("bookid");


--
-- Name: shelf_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "shelf_index" ON "public"."shelf_items" USING "btree" ("shelf");


--
-- Name: unique_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "unique_email" ON "public"."users" USING "btree" ("email");


--
-- Name: unique_username; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "unique_username" ON "public"."users" USING "btree" ("username");


--
-- Name: user_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "user_index" ON "public"."shelves" USING "btree" ("user");


--
-- Name: shelf_items shelf_item_shelf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."shelf_items"
    ADD CONSTRAINT "shelf_item_shelf" FOREIGN KEY ("shelf") REFERENCES "public"."shelves"("id");


--
-- Name: shelves shelf_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."shelves"
    ADD CONSTRAINT "shelf_user" FOREIGN KEY ("user") REFERENCES "public"."users"("id");


--
-- PostgreSQL database dump complete
--

