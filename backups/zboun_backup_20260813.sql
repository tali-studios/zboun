--
-- PostgreSQL database dump
--

\restrict hNLTmfTdY7bhsWPVK6KjYJQIdSBUpc3LZBapCqn8GO8YINqjWiamWoNXBJrNmTq

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_realtime_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in',
    'like',
    'ilike',
    'is',
    'match',
    'imatch',
    'isdistinct'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_realtime_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text,
	negate boolean
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_realtime_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_realtime_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_realtime_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: supabase_admin
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


ALTER FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) OWNER TO supabase_admin;

--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: calculate_delivery_fee(uuid, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_delivery_fee(p_restaurant_id uuid, p_distance_km numeric) RETURNS numeric
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  -- Find the tier that contains this distance
  select coalesce(
    (
      select t.fee_usd
      from public.restaurant_delivery_tiers t
      where t.restaurant_id = p_restaurant_id
        and p_distance_km >= t.min_distance_km
        and p_distance_km <= t.max_distance_km
      limit 1
    ),
    -- Fall back to flat fee if no tiers defined
    (
      select r.delivery_fee_usd
      from public.restaurants r
      where r.id = p_restaurant_id
    ),
    0
  );
$$;


ALTER FUNCTION public.calculate_delivery_fee(p_restaurant_id uuid, p_distance_km numeric) OWNER TO postgres;

--
-- Name: FUNCTION calculate_delivery_fee(p_restaurant_id uuid, p_distance_km numeric); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.calculate_delivery_fee(p_restaurant_id uuid, p_distance_km numeric) IS 'Returns the delivery fee (USD) for a restaurant based on distance. Uses tiers if configured, otherwise falls back to flat delivery_fee_usd.';


--
-- Name: calculate_fast_delivery_fee(uuid, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_fast_delivery_fee(p_restaurant_id uuid, p_distance_km numeric) RETURNS numeric
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  -- Find the tier that contains this distance
  select coalesce(
    (
      select t.fee_usd
      from public.restaurant_fast_delivery_tiers t
      where t.restaurant_id = p_restaurant_id
        and p_distance_km >= t.min_distance_km
        and p_distance_km <= t.max_distance_km
      limit 1
    ),
    -- Fall back to flat fast delivery fee if no tiers defined
    (
      select r.fast_delivery_fee_usd
      from public.restaurants r
      where r.id = p_restaurant_id
    ),
    0
  );
$$;


ALTER FUNCTION public.calculate_fast_delivery_fee(p_restaurant_id uuid, p_distance_km numeric) OWNER TO postgres;

--
-- Name: FUNCTION calculate_fast_delivery_fee(p_restaurant_id uuid, p_distance_km numeric); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.calculate_fast_delivery_fee(p_restaurant_id uuid, p_distance_km numeric) IS 'Returns the fast delivery fee (USD) for a restaurant based on distance. Uses fast delivery tiers if configured, otherwise falls back to flat fast_delivery_fee_usd.';


--
-- Name: increment_menu_coupon_usage(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.increment_menu_coupon_usage(p_coupon_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  updated int;
begin
  update public.menu_coupon_codes
  set times_used = times_used + 1, updated_at = now()
  where id = p_coupon_id
    and is_active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
    and (max_uses is null or times_used < max_uses);
  get diagnostics updated = row_count;
  return updated > 0;
end;
$$;


ALTER FUNCTION public.increment_menu_coupon_usage(p_coupon_id uuid) OWNER TO postgres;

--
-- Name: orders_set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.orders_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION public.orders_set_updated_at() OWNER TO postgres;

--
-- Name: recalculate_loyalty_tier(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.recalculate_loyalty_tier() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  prog public.loyalty_programs%rowtype;
begin
  if not new.tiers_enabled then
    return new;
  end if;

  select * into prog
  from public.loyalty_programs
  where restaurant_id = new.restaurant_id;

  if not found or not prog.tiers_enabled then
    return new;
  end if;

  new.tier :=
    case
      when new.lifetime_points >= prog.tier_platinum_threshold then 'platinum'
      when new.lifetime_points >= prog.tier_gold_threshold     then 'gold'
      when new.lifetime_points >= prog.tier_silver_threshold   then 'silver'
      else 'standard'
    end;

  return new;
end;
$$;


ALTER FUNCTION public.recalculate_loyalty_tier() OWNER TO postgres;

--
-- Name: recalculate_member_tier(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.recalculate_member_tier() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  prog public.loyalty_programs%rowtype;
begin
  select * into prog
  from public.loyalty_programs
  where restaurant_id = new.restaurant_id;

  if not found or not prog.tiers_enabled then
    return new;
  end if;

  new.tier :=
    case
      when new.lifetime_points >= prog.tier_platinum_threshold then 'platinum'
      when new.lifetime_points >= prog.tier_gold_threshold     then 'gold'
      when new.lifetime_points >= prog.tier_silver_threshold   then 'silver'
      else 'standard'
    end;

  return new;
end;
$$;


ALTER FUNCTION public.recalculate_member_tier() OWNER TO postgres;

--
-- Name: restaurant_drivers_set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.restaurant_drivers_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION public.restaurant_drivers_set_updated_at() OWNER TO postgres;

--
-- Name: restaurant_rating_stats(uuid[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.restaurant_rating_stats(p_ids uuid[]) RETURNS TABLE(restaurant_id uuid, avg_rating numeric, rating_count bigint)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select r.restaurant_id,
         round(avg(r.rating)::numeric, 1) as avg_rating,
         count(*)::bigint as rating_count
  from public.restaurant_ratings r
  where r.restaurant_id = any(p_ids)
  group by r.restaurant_id;
$$;


ALTER FUNCTION public.restaurant_rating_stats(p_ids uuid[]) OWNER TO postgres;

--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION public.rls_auto_enable() OWNER TO postgres;

--
-- Name: sync_pms_reservation_totals(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sync_pms_reservation_totals() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
  rid uuid;
begin
  rid := coalesce(new.reservation_id, old.reservation_id);
  update public.pms_reservations r
  set
    charges_total = (
      select coalesce(sum(c.amount), 0)
      from public.pms_charges c
      where c.reservation_id = rid
    ),
    grand_total = r.room_total + (
      select coalesce(sum(c.amount), 0)
      from public.pms_charges c
      where c.reservation_id = rid
    ),
    updated_at = now()
  where r.id = rid;
  return coalesce(new, old);
end;
$$;


ALTER FUNCTION public.sync_pms_reservation_totals() OWNER TO postgres;

--
-- Name: touch_delivery_tiers_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.touch_delivery_tiers_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION public.touch_delivery_tiers_updated_at() OWNER TO postgres;

--
-- Name: touch_fast_delivery_tiers_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.touch_fast_delivery_tiers_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION public.touch_fast_delivery_tiers_updated_at() OWNER TO postgres;

--
-- Name: touch_restaurant_stock_sync_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.touch_restaurant_stock_sync_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION public.touch_restaurant_stock_sync_updated_at() OWNER TO postgres;

--
-- Name: update_inventory_qty(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_inventory_qty() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  update public.inventory_items
  set current_qty = current_qty + NEW.qty,
      updated_at  = now()
  where id = NEW.item_id;
  return NEW;
end;
$$;


ALTER FUNCTION public.update_inventory_qty() OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
    -- Regclass of the table e.g. public.notes
    entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

    -- I, U, D, T: insert, update ...
    action realtime.action = (
        case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
        end
    );

    -- Is row level security enabled for the table
    is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

    subscriptions realtime.subscription[] = array_agg(subs)
        from
            realtime.subscription subs
        where
            subs.entity = entity_
            -- Filter by action early - only get subscriptions interested in this action
            -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
            and (subs.action_filter = '*' or subs.action_filter = action::text);

    -- Subscription vars
    working_role regrole;
    working_selected_columns text[];
    claimed_role regrole;
    claims jsonb;

    subscription_id uuid;
    subscription_has_access bool;
    visible_to_subscription_ids uuid[] = '{}';

    -- structured info for wal's columns
    columns realtime.wal_column[];
    -- previous identity values for update/delete
    old_columns realtime.wal_column[];

    error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

    -- Primary jsonb output for record
    output jsonb;

    -- Loop record for iterating unique roles (outer loop)
    role_record record;
    -- Loop record for iterating unique selected_columns within a role (inner loop)
    cols_record record;
    -- Subscription ids visible at the role level (before fanning out by selected_columns)
    visible_role_sub_ids uuid[] = '{}';

begin
    perform set_config('role', null, true);

    columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    old_columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    for role_record in
        select claims_role
        from (select distinct claims_role from unnest(subscriptions)) t
        order by claims_role::text
    loop
        working_role := role_record.claims_role;

        -- Update `is_selectable` for columns and old_columns (once per role)
        columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(columns) c;

        old_columns =
                array_agg(
                    (
                        c.name,
                        c.type_name,
                        c.type_oid,
                        c.value,
                        c.is_pkey,
                        pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                    )::realtime.wal_column
                )
                from
                    unnest(old_columns) c;

        if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            -- Fan out 400 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 400: Bad Request, no primary key']
                )::realtime.wal_rls;
            end loop;

        -- The claims role does not have SELECT permission to the primary key of entity
        elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            -- Fan out 401 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 401: Unauthorized']
                )::realtime.wal_rls;
            end loop;

        else
            -- Create the prepared statement (once per role)
            if is_rls_enabled and action <> 'DELETE' then
                if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                    deallocate walrus_rls_stmt;
                end if;
                execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            -- Collect all visible subscription IDs for this role (filter check + RLS check)
            visible_role_sub_ids = '{}';

            for subscription_id, claims in (
                    select
                        subs.subscription_id,
                        subs.claims
                    from
                        unnest(subscriptions) subs
                    where
                        subs.entity = entity_
                        and subs.claims_role = working_role
                        and (
                            realtime.is_visible_through_filters(columns, subs.filters)
                            or (
                              action = 'DELETE'
                              and realtime.is_visible_through_filters(old_columns, subs.filters)
                            )
                        )
            ) loop

                if not is_rls_enabled or action = 'DELETE' then
                    visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                else
                    -- Check if RLS allows the role to see the record
                    perform
                        -- Trim leading and trailing quotes from working_role because set_config
                        -- doesn't recognize the role as valid if they are included
                        set_config('role', trim(both '"' from working_role::text), true),
                        set_config('request.jwt.claims', claims::text, true);

                    execute 'execute walrus_rls_stmt' into subscription_has_access;

                    -- Reset the role on every FOR..LOOP batch execution.
                    -- The first batch of 10 rows is pre-fetched using the current connection role (PG internal behaviour)
                    -- then we have to reset it again otherwise it would use the role defined in the `set_config` above
                    -- to fetch the remaining rows when rows>10, which could be a user-defined role that lacks execution grants.
                    -- The flow is:
                    --   1. run batch with conn role
                    --   2. set_config working_role
                    --   3. execute walrus
                    --   4. reset role (revert)
                    --   5. repeat
                    perform set_config('role', null, true);

                    if subscription_has_access then
                        visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                    end if;
                end if;
            end loop;

            perform set_config('role', null, true);

            -- Inner loop: per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;

                output = jsonb_build_object(
                    'schema', wal ->> 'schema',
                    'table', wal ->> 'table',
                    'type', action,
                    'commit_timestamp', to_char(
                        ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                    ),
                    'columns', (
                        select
                            jsonb_agg(
                                jsonb_build_object(
                                    'name', pa.attname,
                                    'type', pt.typname
                                )
                                order by pa.attnum asc
                            )
                        from
                            pg_attribute pa
                            join pg_type pt
                                on pa.atttypid = pt.oid
                            left join (
                                select unnest(conkey) as pkey_attnum
                                from pg_constraint
                                where conrelid = entity_ and contype = 'p'
                            ) pk on pk.pkey_attnum = pa.attnum
                        where
                            attrelid = entity_
                            and attnum > 0
                            and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
                            and (working_selected_columns is null or pa.attname = any(working_selected_columns) or pk.pkey_attnum is not null)
                    )
                )
                -- Add "record" key for insert and update
                || case
                    when action in ('INSERT', 'UPDATE') then
                        jsonb_build_object(
                            'record',
                            (
                                select
                                    jsonb_object_agg(
                                        -- if unchanged toast, get column name and value from old record
                                        coalesce((c).name, (oc).name),
                                        case
                                            when (c).name is null then (oc).value
                                            else (c).value
                                        end
                                    )
                                from
                                    unnest(columns) c
                                    full outer join unnest(old_columns) oc
                                        on (c).name = (oc).name
                                where
                                    coalesce((c).is_selectable, (oc).is_selectable)
                                    and (working_selected_columns is null or coalesce((c).name, (oc).name) = any(working_selected_columns) or coalesce((c).is_pkey, (oc).is_pkey))
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            )
                        )
                    else '{}'::jsonb
                end
                -- Add "old_record" key for update and delete
                || case
                    when action = 'UPDATE' then
                        jsonb_build_object(
                                'old_record',
                                (
                                    select jsonb_object_agg((c).name, (c).value)
                                    from unnest(old_columns) c
                                    where
                                        (c).is_selectable
                                        and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                        and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                )
                            )
                    when action = 'DELETE' then
                        jsonb_build_object(
                            'old_record',
                            (
                                select jsonb_object_agg((c).name, (c).value)
                                from unnest(old_columns) c
                                where
                                    (c).is_selectable
                                    and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                    and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                            )
                        )
                    else '{}'::jsonb
                end;

                -- Filter visible_role_sub_ids to those matching the current selected_columns group
                visible_to_subscription_ids = coalesce(
                    (
                        select array_agg(s.subscription_id)
                        from unnest(subscriptions) s
                        where s.claims_role = working_role
                          and (s.selected_columns is not distinct from working_selected_columns)
                          and s.subscription_id = any(visible_role_sub_ids)
                    ),
                    '{}'::uuid[]
                );

                return next (
                    output,
                    is_rls_enabled,
                    visible_to_subscription_ids,
                    case
                        when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                        else '{}'
                    end
                )::realtime.wal_rls;
            end loop;

        end if;
    end loop;

    perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_realtime_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_realtime_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_realtime_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_realtime_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
/*
Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
*/
declare
    op_symbol text = (
        case
            when op = 'eq' then '='
            when op = 'neq' then '!='
            when op = 'lt' then '<'
            when op = 'lte' then '<='
            when op = 'gt' then '>'
            when op = 'gte' then '>='
            when op = 'in' then '= any'
            else 'UNKNOWN OP'
        end
    );
    res boolean;
begin
    execute format(
        'select %L::'|| type_::text || ' ' || op_symbol
        || ' ( %L::'
        || (
            case
                when op = 'in' then type_::text || '[]'
                else type_::text end
        )
        || ')', val_1, val_2) into res;
    return res;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_realtime_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
declare
    op_symbol text;
    res boolean;
begin
    -- IS DISTINCT FROM / IS NOT DISTINCT FROM: infix, both sides typed literals
    if op = 'isdistinct' then
        execute format(
            'select %L::%s %s %L::%s',
            val_1,
            type_::text,
            case when negate then 'IS NOT DISTINCT FROM' else 'IS DISTINCT FROM' end,
            val_2,
            type_::text
        ) into res;
        return res;
    end if;

    -- IS requires a keyword RHS (NULL, TRUE, FALSE, UNKNOWN), not a typed literal
    if op = 'is' then
        if val_2 not in ('null', 'true', 'false', 'unknown') then
            raise exception 'invalid value for is filter: must be null, true, false, or unknown';
        end if;
        execute format(
            'select %L::%s %s %s',
            val_1,
            type_::text,
            case when negate then 'IS NOT' else 'IS' end,
            upper(val_2)
        ) into res;
        return res;
    end if;

    op_symbol = case
        when op = 'eq'    then '='
        when op = 'neq'   then '!='
        when op = 'lt'    then '<'
        when op = 'lte'   then '<='
        when op = 'gt'    then '>'
        when op = 'gte'   then '>='
        when op = 'in'    then '= any'
        when op = 'like'   then 'LIKE'
        when op = 'ilike'  then 'ILIKE'
        when op = 'match'  then '~'
        when op = 'imatch' then '~*'
        else null
    end;

    if op_symbol is null then
        raise exception 'unsupported equality operator: %', op::text;
    end if;

    execute format(
        'select %L::%s %s (%L::%s)',
        val_1,
        type_::text,
        op_symbol,
        val_2,
        case when op = 'in' then type_::text || '[]' else type_::text end
    ) into res;

    return case when negate then not res else res end;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) OWNER TO supabase_realtime_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
    select
        filters is null
        or array_length(filters, 1) is null
        or coalesce(
            count(col.name) = count(1)
            and sum(
                realtime.check_equality_op(
                    op:=f.op,
                    type_:=coalesce(col.type_oid::regtype, col.type_name::regtype),
                    val_1:=col.value #>> '{}',
                    val_2:=f.value,
                    negate:=coalesce(f.negate, false)
                )::int
            ) filter (where col.name is not null) = count(col.name),
            false
        )
    from
        unnest(filters) f
        left join unnest(columns) col
            on f.column_name = col.name;
$$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_realtime_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_realtime_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  SELECT
    realtime.wal2json_escape_identifier(nsp.nspname::text)
    || '.'
    || realtime.wal2json_escape_identifier(pc.relname::text)
  FROM pg_class pc
  JOIN pg_namespace nsp ON pc.relnamespace = nsp.oid
  WHERE pc.oid = entity
$$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_realtime_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_realtime_admin;

--
-- Name: send_binary(bytea, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, binary_payload, event, topic, private, extension)
    VALUES (generated_id, payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) OWNER TO supabase_realtime_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    col_names text[] = coalesce(
            array_agg(a.attname order by a.attnum),
            '{}'::text[]
        )
        from
            pg_catalog.pg_attribute a
        where
            a.attrelid = new.entity
            and a.attnum > 0
            and not a.attisdropped
            and pg_catalog.has_column_privilege(
                (new.claims ->> 'role'),
                a.attrelid,
                a.attnum,
                'SELECT'
            );
    filter realtime.user_defined_filter;
    col_type regtype;
    in_val jsonb;
    selected_col text;
begin
    for filter in select * from unnest(new.filters) loop
        if not filter.column_name = any(col_names) then
            raise exception 'invalid column for filter %', filter.column_name;
        end if;

        col_type = (
            select atttypid::regtype
            from pg_catalog.pg_attribute
            where attrelid = new.entity
                  and attname = filter.column_name
        );
        if col_type is null then
            raise exception 'failed to lookup type for column %', filter.column_name;
        end if;

        if filter.op = 'in'::realtime.equality_op then
            in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
            if coalesce(jsonb_array_length(in_val), 0) > 100 then
                raise exception 'too many values for `in` filter. Maximum 100';
            end if;
        elsif filter.op = 'is'::realtime.equality_op then
            -- `is` requires a keyword RHS rather than a typed literal
            if filter.value not in ('null', 'true', 'false', 'unknown') then
                raise exception 'invalid value for is filter: must be null, true, false, or unknown';
            end if;
            -- IS NULL works for any type, but IS TRUE/FALSE/UNKNOWN require a boolean
            -- operand. Reject the non-null keywords on non-boolean columns here so they
            -- don't abort apply_rls at WAL time.
            if filter.value <> 'null' and col_type <> 'boolean'::regtype then
                raise exception 'is % filter requires a boolean column, got %', filter.value, col_type::text;
            end if;
        elsif filter.op in ('like'::realtime.equality_op, 'ilike'::realtime.equality_op) then
            -- like/ilike apply the text pattern operator (~~); reject column types that
            -- have no such operator instead of failing at WAL time
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = '~~' and oprleft = col_type
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
        elsif filter.op in ('match'::realtime.equality_op, 'imatch'::realtime.equality_op) then
            -- match/imatch apply the regex operators ~ / ~*; reject column types that have
            -- no such operator (e.g. integer) instead of failing at WAL time, mirroring the
            -- like/ilike guard above.
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = case when filter.op = 'imatch'::realtime.equality_op then '~*' else '~' end
                  and oprleft = col_type
                  and oprright = col_type
                  and oprresult = 'boolean'::regtype
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
            -- validate the regex eagerly so a bad pattern is rejected here, not inside
            -- apply_rls where it would abort the WAL stream for the entity
            begin
                perform '' ~ filter.value;
            exception when others then
                raise exception 'invalid regular expression for % filter: %', filter.op::text, sqlerrm;
            end;
        else
            -- eq/neq/lt/lte/gt/gte: value must be coercable to the type
            perform realtime.cast(filter.value, col_type);
        end if;
    end loop;

    if new.selected_columns is not null then
        for selected_col in select * from unnest(new.selected_columns) loop
            if not selected_col = any(col_names) then
                raise exception 'invalid column for select %', selected_col;
            end if;
        end loop;
    end if;

    -- Apply consistent order to filters so the unique constraint can't be tricked by a
    -- different filter order. negate is part of the sort key.
    new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value, f.negate),
        '{}'
    ) from unnest(new.filters) f;

    new.selected_columns = (
        select array_agg(c order by c)
        from unnest(new.selected_columns) c
    );

    return new;
end;
$$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_realtime_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_realtime_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: wal2json_escape_identifier(text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.wal2json_escape_identifier(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  -- Prefix `\`, `,`, `.`, and any whitespace with `\`
  SELECT regexp_replace(name, '([\\,.[:space:]])', '\\\1', 'g')
$$;


ALTER FUNCTION realtime.wal2json_escape_identifier(name text) OWNER TO supabase_realtime_admin;

--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


ALTER FUNCTION storage.allow_any_operation(expected_operations text[]) OWNER TO supabase_storage_admin;

--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


ALTER FUNCTION storage.allow_only_operation(expected_operation text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    RETURN _parts[array_length(_parts, 1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


ALTER FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.protect_delete() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_claims_allowlist text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


ALTER TABLE auth.custom_oauth_providers OWNER TO supabase_auth_admin;

--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE auth.oauth_client_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


ALTER TABLE auth.webauthn_challenges OWNER TO supabase_auth_admin;

--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


ALTER TABLE auth.webauthn_credentials OWNER TO supabase_auth_admin;

--
-- Name: accounting_expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounting_expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    category text NOT NULL,
    amount numeric(10,2) NOT NULL,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    vendor text,
    reference text,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT accounting_expenses_amount_check CHECK ((amount > (0)::numeric))
);


ALTER TABLE public.accounting_expenses OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    name text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: club_check_ins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.club_check_ins (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    member_id uuid NOT NULL,
    guests_count integer DEFAULT 1 NOT NULL,
    notes text,
    checked_in_by uuid,
    checked_in_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT club_check_ins_guests_count_check CHECK ((guests_count > 0))
);


ALTER TABLE public.club_check_ins OWNER TO postgres;

--
-- Name: club_invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.club_invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    member_id uuid NOT NULL,
    invoice_number text,
    period_start date,
    period_end date,
    amount numeric(10,2) NOT NULL,
    status text DEFAULT 'unpaid'::text NOT NULL,
    paid_at timestamp with time zone,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT club_invoices_status_check CHECK ((status = ANY (ARRAY['unpaid'::text, 'paid'::text, 'waived'::text, 'refunded'::text])))
);


ALTER TABLE public.club_invoices OWNER TO postgres;

--
-- Name: club_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.club_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    plan_id uuid,
    full_name text NOT NULL,
    phone text,
    email text,
    photo_url text,
    member_number text,
    joined_at date DEFAULT CURRENT_DATE NOT NULL,
    expiry_date date,
    status text DEFAULT 'active'::text NOT NULL,
    total_visits integer DEFAULT 0 NOT NULL,
    total_spent numeric(12,2) DEFAULT 0 NOT NULL,
    crm_customer_id uuid,
    loyalty_member_id uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT club_members_status_check CHECK ((status = ANY (ARRAY['active'::text, 'suspended'::text, 'expired'::text, 'cancelled'::text])))
);


ALTER TABLE public.club_members OWNER TO postgres;

--
-- Name: club_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.club_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    billing_cycle text DEFAULT 'monthly'::text NOT NULL,
    duration_days integer,
    max_guests integer DEFAULT 1 NOT NULL,
    benefits text[],
    color text DEFAULT '#6366f1'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT club_plans_billing_cycle_check CHECK ((billing_cycle = ANY (ARRAY['monthly'::text, 'quarterly'::text, 'annual'::text, 'one_time'::text])))
);


ALTER TABLE public.club_plans OWNER TO postgres;

--
-- Name: crm_customer_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crm_customer_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    content text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.crm_customer_notes OWNER TO postgres;

--
-- Name: crm_customer_tag_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crm_customer_tag_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.crm_customer_tag_assignments OWNER TO postgres;

--
-- Name: crm_customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crm_customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    full_name text NOT NULL,
    phone text,
    email text,
    birthday date,
    is_vip boolean DEFAULT false NOT NULL,
    total_spend numeric(12,2) DEFAULT 0 NOT NULL,
    visit_count integer DEFAULT 0 NOT NULL,
    first_visit_at timestamp with time zone,
    last_visit_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT crm_customers_total_spend_check CHECK ((total_spend >= (0)::numeric)),
    CONSTRAINT crm_customers_visit_count_check CHECK ((visit_count >= 0))
);


ALTER TABLE public.crm_customers OWNER TO postgres;

--
-- Name: crm_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crm_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#6366f1'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.crm_tags OWNER TO postgres;

--
-- Name: customer_addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    label text DEFAULT 'other'::text NOT NULL,
    nickname text,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    formatted_address text,
    street text,
    building text,
    apartment text,
    phone text,
    driver_notes text,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    country_code text DEFAULT '+961'::text NOT NULL,
    voice_directions_url text,
    address_photo_urls text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT customer_addresses_label_check CHECK ((label = ANY (ARRAY['home'::text, 'work'::text, 'moms'::text, 'other'::text, 'custom'::text])))
);


ALTER TABLE public.customer_addresses OWNER TO postgres;

--
-- Name: customer_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_profiles (
    id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    phone text,
    country_code text DEFAULT '+961'::text NOT NULL
);


ALTER TABLE public.customer_profiles OWNER TO postgres;

--
-- Name: customer_signup_otps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_signup_otps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    otp_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customer_signup_otps OWNER TO postgres;

--
-- Name: ecommerce_delivery_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ecommerce_delivery_zones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    zone_name text NOT NULL,
    delivery_fee numeric(10,2) DEFAULT 0 NOT NULL,
    min_order numeric(10,2) DEFAULT 0 NOT NULL,
    est_mins integer DEFAULT 45 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ecommerce_delivery_zones OWNER TO postgres;

--
-- Name: ecommerce_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ecommerce_order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    restaurant_id uuid NOT NULL,
    menu_item_id uuid,
    item_name text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    line_total numeric(10,2) NOT NULL,
    special_request text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ecommerce_order_items_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.ecommerce_order_items OWNER TO postgres;

--
-- Name: ecommerce_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ecommerce_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    order_number text,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_email text,
    delivery_address text,
    delivery_zone_id uuid,
    fulfilment_type text DEFAULT 'delivery'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    payment_method text DEFAULT 'cash'::text NOT NULL,
    payment_status text DEFAULT 'unpaid'::text NOT NULL,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    delivery_fee numeric(10,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0 NOT NULL,
    total_amount numeric(10,2) DEFAULT 0 NOT NULL,
    notes text,
    crm_customer_id uuid,
    confirmed_at timestamp with time zone,
    delivered_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ecommerce_orders_fulfilment_type_check CHECK ((fulfilment_type = ANY (ARRAY['delivery'::text, 'pickup'::text]))),
    CONSTRAINT ecommerce_orders_payment_method_check CHECK ((payment_method = ANY (ARRAY['cash'::text, 'card'::text, 'online'::text]))),
    CONSTRAINT ecommerce_orders_payment_status_check CHECK ((payment_status = ANY (ARRAY['unpaid'::text, 'paid'::text, 'refunded'::text]))),
    CONSTRAINT ecommerce_orders_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'preparing'::text, 'ready'::text, 'out_for_delivery'::text, 'delivered'::text, 'cancelled'::text])))
);


ALTER TABLE public.ecommerce_orders OWNER TO postgres;

--
-- Name: ecommerce_stores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ecommerce_stores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    store_name text NOT NULL,
    tagline text,
    is_open boolean DEFAULT true NOT NULL,
    delivery_enabled boolean DEFAULT true NOT NULL,
    pickup_enabled boolean DEFAULT true NOT NULL,
    min_order_amount numeric(10,2) DEFAULT 0 NOT NULL,
    base_delivery_fee numeric(10,2) DEFAULT 0 NOT NULL,
    estimated_delivery_mins integer DEFAULT 45 NOT NULL,
    estimated_pickup_mins integer DEFAULT 20 NOT NULL,
    accepts_cash boolean DEFAULT true NOT NULL,
    accepts_card boolean DEFAULT false NOT NULL,
    accepts_online boolean DEFAULT false NOT NULL,
    tax_rate numeric(5,4) DEFAULT 0 NOT NULL,
    operating_hours text,
    closed_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ecommerce_stores OWNER TO postgres;

--
-- Name: event_booking_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_booking_packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    package_id uuid,
    package_name text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) DEFAULT 0 NOT NULL,
    line_total numeric(10,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_booking_packages_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.event_booking_packages OWNER TO postgres;

--
-- Name: event_bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    space_id uuid,
    reference_number text,
    organiser_name text NOT NULL,
    organiser_phone text NOT NULL,
    organiser_email text,
    organisation text,
    event_name text NOT NULL,
    event_type text DEFAULT 'private_party'::text NOT NULL,
    event_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone,
    guest_count integer NOT NULL,
    status text DEFAULT 'inquiry'::text NOT NULL,
    space_fee numeric(10,2) DEFAULT 0 NOT NULL,
    packages_total numeric(10,2) DEFAULT 0 NOT NULL,
    extras_total numeric(10,2) DEFAULT 0 NOT NULL,
    total_amount numeric(10,2) DEFAULT 0 NOT NULL,
    deposit_amount numeric(10,2) DEFAULT 0 NOT NULL,
    deposit_paid_at timestamp with time zone,
    balance_due numeric(10,2) GENERATED ALWAYS AS ((total_amount - deposit_amount)) STORED,
    special_requests text,
    internal_notes text,
    crm_customer_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_bookings_event_type_check CHECK ((event_type = ANY (ARRAY['private_party'::text, 'corporate'::text, 'wedding'::text, 'birthday'::text, 'graduation'::text, 'meeting'::text, 'other'::text]))),
    CONSTRAINT event_bookings_guest_count_check CHECK ((guest_count > 0)),
    CONSTRAINT event_bookings_status_check CHECK ((status = ANY (ARRAY['inquiry'::text, 'confirmed'::text, 'deposit_paid'::text, 'completed'::text, 'cancelled'::text])))
);


ALTER TABLE public.event_bookings OWNER TO postgres;

--
-- Name: event_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_packages_price_check CHECK ((price >= (0)::numeric))
);


ALTER TABLE public.event_packages OWNER TO postgres;

--
-- Name: event_spaces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_spaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    capacity_min integer,
    capacity_max integer NOT NULL,
    pricing_type text DEFAULT 'flat'::text NOT NULL,
    base_price numeric(10,2) DEFAULT 0 NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    amenities text[],
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_spaces_base_price_check CHECK ((base_price >= (0)::numeric)),
    CONSTRAINT event_spaces_capacity_max_check CHECK ((capacity_max > 0)),
    CONSTRAINT event_spaces_capacity_min_check CHECK ((capacity_min > 0)),
    CONSTRAINT event_spaces_pricing_type_check CHECK ((pricing_type = ANY (ARRAY['flat'::text, 'hourly'::text])))
);


ALTER TABLE public.event_spaces OWNER TO postgres;

--
-- Name: fleet_deliveries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fleet_deliveries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    driver_id uuid,
    vehicle_id uuid,
    pos_order_id uuid,
    ecommerce_order_id uuid,
    customer_name text NOT NULL,
    customer_phone text,
    delivery_address text NOT NULL,
    status text DEFAULT 'assigned'::text NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL,
    picked_up_at timestamp with time zone,
    delivered_at timestamp with time zone,
    distance_km numeric(8,2),
    delivery_fee numeric(10,2) DEFAULT 0 NOT NULL,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT fleet_deliveries_status_check CHECK ((status = ANY (ARRAY['assigned'::text, 'picked_up'::text, 'in_transit'::text, 'delivered'::text, 'failed'::text, 'cancelled'::text])))
);


ALTER TABLE public.fleet_deliveries OWNER TO postgres;

--
-- Name: fleet_drivers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fleet_drivers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    full_name text NOT NULL,
    phone text NOT NULL,
    license_number text,
    license_expiry date,
    vehicle_id uuid,
    status text DEFAULT 'available'::text NOT NULL,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT fleet_drivers_status_check CHECK ((status = ANY (ARRAY['available'::text, 'on_delivery'::text, 'off_duty'::text, 'inactive'::text])))
);


ALTER TABLE public.fleet_drivers OWNER TO postgres;

--
-- Name: fleet_vehicle_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fleet_vehicle_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    vehicle_id uuid NOT NULL,
    log_type text DEFAULT 'fuel'::text NOT NULL,
    description text NOT NULL,
    amount numeric(10,2),
    odometer_km numeric(10,2),
    log_date date DEFAULT CURRENT_DATE NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT fleet_vehicle_logs_log_type_check CHECK ((log_type = ANY (ARRAY['fuel'::text, 'mileage'::text, 'maintenance'::text, 'inspection'::text, 'incident'::text, 'other'::text])))
);


ALTER TABLE public.fleet_vehicle_logs OWNER TO postgres;

--
-- Name: fleet_vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fleet_vehicles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    plate_number text NOT NULL,
    make text,
    model text,
    vehicle_type text DEFAULT 'motorcycle'::text NOT NULL,
    year integer,
    color text,
    status text DEFAULT 'available'::text NOT NULL,
    insurance_expiry date,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT fleet_vehicles_status_check CHECK ((status = ANY (ARRAY['available'::text, 'on_delivery'::text, 'maintenance'::text, 'inactive'::text]))),
    CONSTRAINT fleet_vehicles_vehicle_type_check CHECK ((vehicle_type = ANY (ARRAY['motorcycle'::text, 'car'::text, 'van'::text, 'truck'::text, 'bicycle'::text, 'other'::text])))
);


ALTER TABLE public.fleet_vehicles OWNER TO postgres;

--
-- Name: gym_member_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gym_member_packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    club_member_id uuid,
    member_name text NOT NULL,
    member_phone text,
    package_id uuid NOT NULL,
    purchased_sessions integer NOT NULL,
    used_sessions integer DEFAULT 0 NOT NULL,
    remaining_sessions integer NOT NULL,
    purchase_date date DEFAULT CURRENT_DATE NOT NULL,
    expiry_date date,
    status text DEFAULT 'active'::text NOT NULL,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT gym_member_packages_purchased_sessions_check CHECK ((purchased_sessions > 0)),
    CONSTRAINT gym_member_packages_remaining_sessions_check CHECK ((remaining_sessions >= 0)),
    CONSTRAINT gym_member_packages_status_check CHECK ((status = ANY (ARRAY['active'::text, 'expired'::text, 'cancelled'::text, 'completed'::text]))),
    CONSTRAINT gym_member_packages_used_sessions_check CHECK ((used_sessions >= 0))
);


ALTER TABLE public.gym_member_packages OWNER TO postgres;

--
-- Name: gym_pt_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gym_pt_packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    name text NOT NULL,
    session_count integer NOT NULL,
    price numeric(10,2) NOT NULL,
    valid_days integer,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT gym_pt_packages_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT gym_pt_packages_session_count_check CHECK ((session_count > 0)),
    CONSTRAINT gym_pt_packages_valid_days_check CHECK (((valid_days IS NULL) OR (valid_days > 0)))
);


ALTER TABLE public.gym_pt_packages OWNER TO postgres;

--
-- Name: gym_pt_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gym_pt_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    trainer_id uuid NOT NULL,
    member_name text NOT NULL,
    member_phone text,
    package_id uuid,
    session_type text DEFAULT 'pt'::text NOT NULL,
    status text DEFAULT 'scheduled'::text NOT NULL,
    scheduled_at timestamp with time zone NOT NULL,
    duration_mins integer DEFAULT 60 NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    payment_status text DEFAULT 'unpaid'::text NOT NULL,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT gym_pt_sessions_duration_mins_check CHECK ((duration_mins > 0)),
    CONSTRAINT gym_pt_sessions_payment_status_check CHECK ((payment_status = ANY (ARRAY['unpaid'::text, 'paid'::text]))),
    CONSTRAINT gym_pt_sessions_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT gym_pt_sessions_session_type_check CHECK ((session_type = ANY (ARRAY['pt'::text, 'assessment'::text, 'group'::text]))),
    CONSTRAINT gym_pt_sessions_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'completed'::text, 'cancelled'::text, 'no_show'::text])))
);


ALTER TABLE public.gym_pt_sessions OWNER TO postgres;

--
-- Name: gym_trainer_payouts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gym_trainer_payouts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    trainer_id uuid NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    base_amount numeric(10,2) DEFAULT 0 NOT NULL,
    session_amount numeric(10,2) DEFAULT 0 NOT NULL,
    bonus_amount numeric(10,2) DEFAULT 0 NOT NULL,
    total_amount numeric(10,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    paid_at timestamp with time zone,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT gym_trainer_payouts_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'approved'::text, 'paid'::text])))
);


ALTER TABLE public.gym_trainer_payouts OWNER TO postgres;

--
-- Name: gym_trainers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gym_trainers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    full_name text NOT NULL,
    phone text,
    email text,
    specialty text,
    employment_type text DEFAULT 'full_time'::text NOT NULL,
    salary_type text DEFAULT 'base'::text NOT NULL,
    base_salary numeric(10,2) DEFAULT 0 NOT NULL,
    session_rate numeric(10,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    hire_date date,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT gym_trainers_employment_type_check CHECK ((employment_type = ANY (ARRAY['full_time'::text, 'part_time'::text, 'contract'::text]))),
    CONSTRAINT gym_trainers_salary_type_check CHECK ((salary_type = ANY (ARRAY['base'::text, 'per_session'::text, 'hybrid'::text])))
);


ALTER TABLE public.gym_trainers OWNER TO postgres;

--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    supplier_id uuid,
    name text NOT NULL,
    sku text,
    unit text DEFAULT 'pieces'::text NOT NULL,
    current_qty numeric(12,3) DEFAULT 0 NOT NULL,
    min_qty numeric(12,3) DEFAULT 0 NOT NULL,
    cost_per_unit numeric(10,2) DEFAULT 0 NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT inventory_items_cost_per_unit_check CHECK ((cost_per_unit >= (0)::numeric)),
    CONSTRAINT inventory_items_min_qty_check CHECK ((min_qty >= (0)::numeric))
);


ALTER TABLE public.inventory_items OWNER TO postgres;

--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_movements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    item_id uuid NOT NULL,
    movement_type text NOT NULL,
    qty numeric(12,3) NOT NULL,
    unit_cost numeric(10,2),
    reference text,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT inventory_movements_movement_type_check CHECK ((movement_type = ANY (ARRAY['purchase'::text, 'consume'::text, 'waste'::text, 'adjustment'::text])))
);


ALTER TABLE public.inventory_movements OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    subscription_id uuid,
    period_start date,
    period_end date,
    amount_due numeric(10,2) NOT NULL,
    amount_paid numeric(10,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'unpaid'::text NOT NULL,
    due_at timestamp with time zone NOT NULL,
    paid_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT invoices_amount_due_check CHECK ((amount_due >= (0)::numeric)),
    CONSTRAINT invoices_amount_paid_check CHECK ((amount_paid >= (0)::numeric)),
    CONSTRAINT invoices_status_check CHECK ((status = ANY (ARRAY['unpaid'::text, 'partial'::text, 'paid'::text, 'void'::text])))
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: loyalty_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loyalty_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    crm_customer_id uuid,
    phone text,
    email text,
    full_name text NOT NULL,
    points_balance integer DEFAULT 0 NOT NULL,
    stamps_balance integer DEFAULT 0 NOT NULL,
    total_stamps_ever integer DEFAULT 0 NOT NULL,
    lifetime_points integer DEFAULT 0 NOT NULL,
    tier text DEFAULT 'standard'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    enrolled_at timestamp with time zone DEFAULT now() NOT NULL,
    last_activity_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT loyalty_members_points_balance_check CHECK ((points_balance >= 0)),
    CONSTRAINT loyalty_members_stamps_balance_check CHECK ((stamps_balance >= 0)),
    CONSTRAINT loyalty_members_tier_check CHECK ((tier = ANY (ARRAY['standard'::text, 'silver'::text, 'gold'::text, 'platinum'::text]))),
    CONSTRAINT phone_or_email_required CHECK (((phone IS NOT NULL) OR (email IS NOT NULL)))
);


ALTER TABLE public.loyalty_members OWNER TO postgres;

--
-- Name: loyalty_programs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loyalty_programs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    points_enabled boolean DEFAULT true NOT NULL,
    points_per_dollar numeric(8,2) DEFAULT 1 NOT NULL,
    points_redeem_per_dollar numeric(8,2) DEFAULT 100 NOT NULL,
    stamps_enabled boolean DEFAULT false NOT NULL,
    stamps_required integer DEFAULT 10 NOT NULL,
    stamp_reward_desc text,
    referral_enabled boolean DEFAULT false NOT NULL,
    referral_bonus_points integer DEFAULT 50 NOT NULL,
    tiers_enabled boolean DEFAULT false NOT NULL,
    tier_silver_threshold integer DEFAULT 500 NOT NULL,
    tier_gold_threshold integer DEFAULT 1500 NOT NULL,
    tier_platinum_threshold integer DEFAULT 5000 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT loyalty_programs_points_per_dollar_check CHECK ((points_per_dollar > (0)::numeric)),
    CONSTRAINT loyalty_programs_points_redeem_per_dollar_check CHECK ((points_redeem_per_dollar > (0)::numeric)),
    CONSTRAINT loyalty_programs_stamps_required_check CHECK ((stamps_required > 0))
);


ALTER TABLE public.loyalty_programs OWNER TO postgres;

--
-- Name: loyalty_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loyalty_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    member_id uuid NOT NULL,
    pos_order_id uuid,
    type text NOT NULL,
    points_delta integer DEFAULT 0 NOT NULL,
    stamps_delta integer DEFAULT 0 NOT NULL,
    description text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT loyalty_transactions_type_check CHECK ((type = ANY (ARRAY['earn_points'::text, 'redeem_points'::text, 'earn_stamp'::text, 'stamp_reward'::text, 'referral_bonus'::text, 'adjustment'::text, 'tier_upgrade'::text, 'expiry'::text])))
);


ALTER TABLE public.loyalty_transactions OWNER TO postgres;

--
-- Name: menu_brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_brands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    name text NOT NULL,
    logo_url text,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.menu_brands OWNER TO postgres;

--
-- Name: menu_coupon_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_coupon_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    code text NOT NULL,
    percent_off numeric(5,2) NOT NULL,
    max_uses integer,
    times_used integer DEFAULT 0 NOT NULL,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT menu_coupon_codes_max_uses_check CHECK (((max_uses IS NULL) OR (max_uses > 0))),
    CONSTRAINT menu_coupon_codes_percent_off_check CHECK (((percent_off > (0)::numeric) AND (percent_off <= (100)::numeric))),
    CONSTRAINT menu_coupon_codes_times_used_check CHECK ((times_used >= 0))
);


ALTER TABLE public.menu_coupon_codes OWNER TO postgres;

--
-- Name: menu_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    category_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    image_url text,
    is_available boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    contents text,
    grams integer,
    removable_ingredients jsonb DEFAULT '[]'::jsonb NOT NULL,
    add_ingredients jsonb DEFAULT '[]'::jsonb NOT NULL,
    option_label text,
    option_values jsonb DEFAULT '[]'::jsonb NOT NULL,
    sold_by_weight boolean DEFAULT false NOT NULL,
    price_per_kg numeric(10,2),
    weight_step_kg numeric(6,3) DEFAULT 0.1 NOT NULL,
    brand_name text,
    brand_id uuid,
    display_quantity numeric(10,3),
    display_unit text DEFAULT 'g'::text NOT NULL,
    calories integer,
    protein_g numeric(8,2),
    track_stock boolean DEFAULT false NOT NULL,
    stock_quantity integer,
    stock_alert_warning_qty integer,
    stock_alert_urgent_qty integer,
    stock_alert_critical_qty integer,
    stock_alert_warning_sent_at timestamp with time zone,
    stock_alert_urgent_sent_at timestamp with time zone,
    stock_alert_critical_sent_at timestamp with time zone,
    stock_alert_out_sent_at timestamp with time zone,
    external_sku text,
    option_variant_stock jsonb DEFAULT '{}'::jsonb NOT NULL,
    audience text,
    CONSTRAINT menu_items_audience_check CHECK (((audience IS NULL) OR (audience = ANY (ARRAY['men'::text, 'women'::text, 'unisex'::text, 'boys'::text, 'girls'::text])))),
    CONSTRAINT menu_items_calories_check CHECK (((calories IS NULL) OR (calories >= 0))),
    CONSTRAINT menu_items_display_unit_check CHECK ((display_unit = ANY (ARRAY['g'::text, 'kg'::text, 'ml'::text, 'l'::text]))),
    CONSTRAINT menu_items_grams_check CHECK (((grams IS NULL) OR (grams >= 0))),
    CONSTRAINT menu_items_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT menu_items_protein_g_check CHECK (((protein_g IS NULL) OR (protein_g >= (0)::numeric))),
    CONSTRAINT menu_items_stock_alert_critical_qty_check CHECK (((stock_alert_critical_qty IS NULL) OR (stock_alert_critical_qty >= 1))),
    CONSTRAINT menu_items_stock_alert_urgent_qty_check CHECK (((stock_alert_urgent_qty IS NULL) OR (stock_alert_urgent_qty >= 1))),
    CONSTRAINT menu_items_stock_alert_warning_qty_check CHECK (((stock_alert_warning_qty IS NULL) OR (stock_alert_warning_qty >= 1))),
    CONSTRAINT menu_items_stock_quantity_check CHECK (((stock_quantity IS NULL) OR (stock_quantity >= 0))),
    CONSTRAINT menu_items_weight_price_required CHECK (((sold_by_weight = false) OR ((price_per_kg IS NOT NULL) AND (price_per_kg >= (0)::numeric)))),
    CONSTRAINT menu_items_weight_step_min CHECK ((weight_step_kg >= 0.01))
);


ALTER TABLE public.menu_items OWNER TO postgres;

--
-- Name: COLUMN menu_items.option_variant_stock; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.menu_items.option_variant_stock IS 'Map of variant key → quantity. Empty {} means use item-level stock_quantity only.';


--
-- Name: menu_promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_promotions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    scope_type text NOT NULL,
    scope_id uuid,
    percent_off numeric(5,2) NOT NULL,
    label text,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT menu_promotions_percent_off_check CHECK (((percent_off > (0)::numeric) AND (percent_off <= (100)::numeric))),
    CONSTRAINT menu_promotions_scope_check CHECK ((((scope_type = 'store'::text) AND (scope_id IS NULL)) OR ((scope_type <> 'store'::text) AND (scope_id IS NOT NULL)))),
    CONSTRAINT menu_promotions_scope_type_check CHECK ((scope_type = ANY (ARRAY['store'::text, 'category'::text, 'brand'::text, 'item'::text])))
);


ALTER TABLE public.menu_promotions OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    customer_id uuid,
    customer_name text NOT NULL,
    customer_phone text,
    delivery_address text,
    delivery_lat double precision,
    delivery_lng double precision,
    items jsonb DEFAULT '[]'::jsonb NOT NULL,
    notes text,
    total_usd numeric(10,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    whatsapp_sent boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    delivery_fee_usd numeric(10,2) DEFAULT 0 NOT NULL,
    scheduled_for timestamp with time zone,
    delivery_speed text DEFAULT 'standard'::text NOT NULL,
    payment_note text,
    coupon_code text,
    coupon_discount_usd numeric(10,2) DEFAULT 0 NOT NULL,
    coupon_code_id uuid,
    expected_delivery_time text,
    expected_delivery_time_set_at timestamp with time zone,
    driver_id uuid,
    driver_assigned_at timestamp with time zone,
    CONSTRAINT orders_delivery_speed_check CHECK ((delivery_speed = ANY (ARRAY['standard'::text, 'fast'::text]))),
    CONSTRAINT orders_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'preparing'::text, 'ready'::text, 'out_for_delivery'::text, 'delivered'::text, 'cancelled'::text])))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: password_change_otps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_change_otps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    otp_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_change_otps OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    restaurant_id uuid NOT NULL,
    amount_paid numeric(10,2) NOT NULL,
    paid_at timestamp with time zone DEFAULT now() NOT NULL,
    method text DEFAULT 'cash'::text NOT NULL,
    reference_note text,
    recorded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payments_amount_paid_check CHECK ((amount_paid > (0)::numeric)),
    CONSTRAINT payments_method_check CHECK ((method = 'cash'::text))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payroll_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payroll_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payroll_run_id uuid NOT NULL,
    restaurant_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    base_amount numeric(10,2) DEFAULT 0 NOT NULL,
    overtime_amount numeric(10,2) DEFAULT 0 NOT NULL,
    bonus_amount numeric(10,2) DEFAULT 0 NOT NULL,
    deduction_amount numeric(10,2) DEFAULT 0 NOT NULL,
    net_amount numeric(10,2) DEFAULT 0 NOT NULL,
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payroll_entries_base_amount_check CHECK ((base_amount >= (0)::numeric)),
    CONSTRAINT payroll_entries_bonus_amount_check CHECK ((bonus_amount >= (0)::numeric)),
    CONSTRAINT payroll_entries_deduction_amount_check CHECK ((deduction_amount >= (0)::numeric)),
    CONSTRAINT payroll_entries_net_amount_check CHECK ((net_amount >= (0)::numeric)),
    CONSTRAINT payroll_entries_overtime_amount_check CHECK ((overtime_amount >= (0)::numeric))
);


ALTER TABLE public.payroll_entries OWNER TO postgres;

--
-- Name: payroll_runs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payroll_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payroll_runs_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'approved'::text, 'paid'::text])))
);


ALTER TABLE public.payroll_runs OWNER TO postgres;

--
-- Name: platform_ops_payment_reminder_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_ops_payment_reminder_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payment_id uuid NOT NULL,
    reminder_kind text NOT NULL,
    due_at date NOT NULL,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT platform_ops_payment_reminder_log_reminder_kind_check CHECK ((reminder_kind = ANY (ARRAY['one_month'::text, 'one_week'::text, 'three_days'::text])))
);


ALTER TABLE public.platform_ops_payment_reminder_log OWNER TO postgres;

--
-- Name: platform_ops_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_ops_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    category text DEFAULT 'other'::text NOT NULL,
    amount numeric(12,2),
    currency text DEFAULT 'USD'::text NOT NULL,
    due_at timestamp with time zone NOT NULL,
    paid_at timestamp with time zone,
    notes text,
    reminder_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT platform_ops_payments_category_check CHECK ((category = ANY (ARRAY['domain'::text, 'hosting'::text, 'saas'::text, 'marketing'::text, 'other'::text])))
);


ALTER TABLE public.platform_ops_payments OWNER TO postgres;

--
-- Name: pms_charges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pms_charges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    reservation_id uuid NOT NULL,
    category text DEFAULT 'other'::text NOT NULL,
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    charged_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pms_charges_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT pms_charges_category_check CHECK ((category = ANY (ARRAY['restaurant'::text, 'minibar'::text, 'room_service'::text, 'laundry'::text, 'spa'::text, 'phone'::text, 'other'::text])))
);


ALTER TABLE public.pms_charges OWNER TO postgres;

--
-- Name: pms_housekeeping_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pms_housekeeping_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    room_id uuid NOT NULL,
    task_type text DEFAULT 'cleaning'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    assigned_to text,
    notes text,
    scheduled_date date DEFAULT CURRENT_DATE NOT NULL,
    completed_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pms_housekeeping_logs_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'done'::text]))),
    CONSTRAINT pms_housekeeping_logs_task_type_check CHECK ((task_type = ANY (ARRAY['cleaning'::text, 'turndown'::text, 'inspection'::text, 'maintenance'::text, 'deep_clean'::text])))
);


ALTER TABLE public.pms_housekeeping_logs OWNER TO postgres;

--
-- Name: pms_reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pms_reservations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    room_id uuid,
    room_type_id uuid,
    reference_number text,
    guest_name text NOT NULL,
    guest_phone text,
    guest_email text,
    guest_id_number text,
    nationality text,
    adults integer DEFAULT 1 NOT NULL,
    children integer DEFAULT 0 NOT NULL,
    check_in_date date NOT NULL,
    check_out_date date NOT NULL,
    actual_check_in timestamp with time zone,
    actual_check_out timestamp with time zone,
    nights integer GENERATED ALWAYS AS ((check_out_date - check_in_date)) STORED,
    status text DEFAULT 'confirmed'::text NOT NULL,
    rate_per_night numeric(10,2) DEFAULT 0 NOT NULL,
    room_total numeric(10,2) DEFAULT 0 NOT NULL,
    charges_total numeric(10,2) DEFAULT 0 NOT NULL,
    grand_total numeric(10,2) DEFAULT 0 NOT NULL,
    amount_paid numeric(10,2) DEFAULT 0 NOT NULL,
    balance_due numeric(10,2) GENERATED ALWAYS AS ((grand_total - amount_paid)) STORED,
    booking_source text DEFAULT 'direct'::text,
    special_requests text,
    internal_notes text,
    crm_customer_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_out_after_check_in CHECK ((check_out_date > check_in_date)),
    CONSTRAINT pms_reservations_adults_check CHECK ((adults > 0)),
    CONSTRAINT pms_reservations_booking_source_check CHECK ((booking_source = ANY (ARRAY['direct'::text, 'phone'::text, 'walk_in'::text, 'online'::text, 'ota'::text, 'corporate'::text]))),
    CONSTRAINT pms_reservations_children_check CHECK ((children >= 0)),
    CONSTRAINT pms_reservations_status_check CHECK ((status = ANY (ARRAY['inquiry'::text, 'confirmed'::text, 'checked_in'::text, 'checked_out'::text, 'cancelled'::text, 'no_show'::text])))
);


ALTER TABLE public.pms_reservations OWNER TO postgres;

--
-- Name: pms_room_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pms_room_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    capacity integer DEFAULT 2 NOT NULL,
    base_rate numeric(10,2) DEFAULT 0 NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    amenities text[],
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pms_room_types_base_rate_check CHECK ((base_rate >= (0)::numeric)),
    CONSTRAINT pms_room_types_capacity_check CHECK ((capacity > 0))
);


ALTER TABLE public.pms_room_types OWNER TO postgres;

--
-- Name: pms_rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pms_rooms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    room_type_id uuid,
    room_number text NOT NULL,
    floor integer,
    status text DEFAULT 'available'::text NOT NULL,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pms_rooms_status_check CHECK ((status = ANY (ARRAY['available'::text, 'occupied'::text, 'reserved'::text, 'maintenance'::text, 'housekeeping'::text])))
);


ALTER TABLE public.pms_rooms OWNER TO postgres;

--
-- Name: pos_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pos_order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    restaurant_id uuid NOT NULL,
    menu_item_id uuid,
    item_name text NOT NULL,
    qty numeric(10,3) NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    line_total numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pos_order_items_line_total_check CHECK ((line_total >= (0)::numeric)),
    CONSTRAINT pos_order_items_qty_check CHECK ((qty > (0)::numeric)),
    CONSTRAINT pos_order_items_unit_price_check CHECK ((unit_price >= (0)::numeric))
);


ALTER TABLE public.pos_order_items OWNER TO postgres;

--
-- Name: pos_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pos_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    session_id uuid,
    receipt_number text,
    order_type text DEFAULT 'dine_in'::text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0 NOT NULL,
    total_amount numeric(10,2) DEFAULT 0 NOT NULL,
    paid_amount numeric(10,2) DEFAULT 0 NOT NULL,
    note text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    customer_id uuid,
    CONSTRAINT pos_orders_order_type_check CHECK ((order_type = ANY (ARRAY['dine_in'::text, 'takeaway'::text, 'delivery'::text]))),
    CONSTRAINT pos_orders_paid_amount_check CHECK ((paid_amount >= (0)::numeric)),
    CONSTRAINT pos_orders_status_check CHECK ((status = ANY (ARRAY['open'::text, 'paid'::text, 'void'::text]))),
    CONSTRAINT pos_orders_subtotal_check CHECK ((subtotal >= (0)::numeric)),
    CONSTRAINT pos_orders_tax_amount_check CHECK ((tax_amount >= (0)::numeric)),
    CONSTRAINT pos_orders_total_amount_check CHECK ((total_amount >= (0)::numeric))
);


ALTER TABLE public.pos_orders OWNER TO postgres;

--
-- Name: pos_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pos_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    restaurant_id uuid NOT NULL,
    method text DEFAULT 'cash'::text NOT NULL,
    amount numeric(10,2) NOT NULL,
    paid_at timestamp with time zone DEFAULT now() NOT NULL,
    reference text,
    recorded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pos_payments_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT pos_payments_method_check CHECK ((method = ANY (ARRAY['cash'::text, 'card'::text, 'transfer'::text])))
);


ALTER TABLE public.pos_payments OWNER TO postgres;

--
-- Name: pos_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pos_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    opened_by uuid,
    opened_at timestamp with time zone DEFAULT now() NOT NULL,
    closed_at timestamp with time zone,
    status text DEFAULT 'open'::text NOT NULL,
    opening_float numeric(10,2) DEFAULT 0 NOT NULL,
    closing_note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT pos_sessions_opening_float_check CHECK ((opening_float >= (0)::numeric)),
    CONSTRAINT pos_sessions_status_check CHECK ((status = ANY (ARRAY['open'::text, 'closed'::text])))
);


ALTER TABLE public.pos_sessions OWNER TO postgres;

--
-- Name: restaurant_addons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_addons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    addon_key text NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    enabled_at timestamp with time zone DEFAULT now() NOT NULL,
    enabled_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.restaurant_addons OWNER TO postgres;

--
-- Name: restaurant_delivery_tiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_delivery_tiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    min_distance_km numeric(6,2) NOT NULL,
    max_distance_km numeric(6,2) NOT NULL,
    fee_usd numeric(10,2) NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT restaurant_delivery_tiers_check CHECK ((max_distance_km > min_distance_km)),
    CONSTRAINT restaurant_delivery_tiers_fee_usd_check CHECK ((fee_usd >= (0)::numeric)),
    CONSTRAINT restaurant_delivery_tiers_min_distance_km_check CHECK ((min_distance_km >= (0)::numeric))
);


ALTER TABLE public.restaurant_delivery_tiers OWNER TO postgres;

--
-- Name: TABLE restaurant_delivery_tiers; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.restaurant_delivery_tiers IS 'Distance-based delivery fee tiers for restaurants. Example: 0-5km = $2, 5-10km = $3, 10-15km = $5. If no tiers exist, fall back to flat delivery_fee_usd.';


--
-- Name: COLUMN restaurant_delivery_tiers."position"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.restaurant_delivery_tiers."position" IS 'Display order for admin UI (smaller = shown first).';


--
-- Name: restaurant_drivers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_drivers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    full_name text NOT NULL,
    phone text,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.restaurant_drivers OWNER TO postgres;

--
-- Name: restaurant_employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    full_name text NOT NULL,
    role_title text NOT NULL,
    base_salary numeric(10,2) DEFAULT 0 NOT NULL,
    salary_type text DEFAULT 'monthly'::text NOT NULL,
    hire_date date,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT restaurant_employees_base_salary_check CHECK ((base_salary >= (0)::numeric)),
    CONSTRAINT restaurant_employees_salary_type_check CHECK ((salary_type = ANY (ARRAY['monthly'::text, 'hourly'::text])))
);


ALTER TABLE public.restaurant_employees OWNER TO postgres;

--
-- Name: restaurant_fast_delivery_tiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_fast_delivery_tiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    min_distance_km numeric(6,2) NOT NULL,
    max_distance_km numeric(6,2) NOT NULL,
    fee_usd numeric(10,2) NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT restaurant_fast_delivery_tiers_check CHECK ((max_distance_km > min_distance_km)),
    CONSTRAINT restaurant_fast_delivery_tiers_fee_usd_check CHECK ((fee_usd >= (0)::numeric)),
    CONSTRAINT restaurant_fast_delivery_tiers_min_distance_km_check CHECK ((min_distance_km >= (0)::numeric))
);


ALTER TABLE public.restaurant_fast_delivery_tiers OWNER TO postgres;

--
-- Name: TABLE restaurant_fast_delivery_tiers; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.restaurant_fast_delivery_tiers IS 'Distance-based fast delivery fee tiers for restaurants. Independent from regular delivery tiers to give full control over fast delivery pricing.';


--
-- Name: restaurant_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    name text DEFAULT 'Main Branch'::text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    address text,
    phone text,
    is_main boolean DEFAULT false NOT NULL,
    "position" smallint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.restaurant_locations OWNER TO postgres;

--
-- Name: restaurant_ratings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_ratings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    rater_id text NOT NULL,
    rating numeric(2,1) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT restaurant_ratings_rating_check CHECK (((rating >= (1)::numeric) AND (rating <= (5)::numeric)))
);


ALTER TABLE public.restaurant_ratings OWNER TO postgres;

--
-- Name: restaurant_stock_sync; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_stock_sync (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    platform text DEFAULT 'custom'::text NOT NULL,
    is_enabled boolean DEFAULT false NOT NULL,
    inbound_api_key text NOT NULL,
    outbound_webhook_url text,
    outbound_secret text NOT NULL,
    last_inbound_at timestamp with time zone,
    last_outbound_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT restaurant_stock_sync_platform_check CHECK ((platform = ANY (ARRAY['shopify'::text, 'woocommerce'::text, 'custom'::text])))
);


ALTER TABLE public.restaurant_stock_sync OWNER TO postgres;

--
-- Name: restaurant_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    plan_id uuid,
    status text NOT NULL,
    start_at timestamp with time zone DEFAULT now() NOT NULL,
    next_due_at timestamp with time zone,
    ended_at timestamp with time zone,
    billing_cycle_price numeric(10,2) NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT restaurant_subscriptions_billing_cycle_price_check CHECK ((billing_cycle_price >= (0)::numeric)),
    CONSTRAINT restaurant_subscriptions_status_check CHECK ((status = ANY (ARRAY['trial'::text, 'active'::text, 'overdue'::text, 'paused'::text, 'cancelled'::text])))
);


ALTER TABLE public.restaurant_subscriptions OWNER TO postgres;

--
-- Name: restaurants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    phone text NOT NULL,
    logo_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    show_on_home boolean DEFAULT true NOT NULL,
    lbp_rate numeric(12,2) DEFAULT 89500 NOT NULL,
    browse_sections text[] DEFAULT ARRAY['Lunch'::text] NOT NULL,
    banner_url text,
    description text,
    rating numeric(2,1),
    location text,
    eta_label text,
    business_type text DEFAULT 'restaurant'::text NOT NULL,
    latitude double precision,
    longitude double precision,
    delivery_radius_km numeric(6,2) DEFAULT 15,
    free_delivery boolean DEFAULT false NOT NULL,
    delivery_fee_usd numeric(10,2) DEFAULT 0 NOT NULL,
    opening_hours jsonb DEFAULT '[{"day": 0, "open": "10:00", "close": "22:00", "closed": false}, {"day": 1, "open": "09:00", "close": "22:00", "closed": false}, {"day": 2, "open": "09:00", "close": "22:00", "closed": false}, {"day": 3, "open": "09:00", "close": "22:00", "closed": false}, {"day": 4, "open": "09:00", "close": "22:00", "closed": false}, {"day": 5, "open": "09:00", "close": "22:00", "closed": false}, {"day": 6, "open": "09:00", "close": "22:00", "closed": false}]'::jsonb NOT NULL,
    is_temporarily_closed boolean DEFAULT false NOT NULL,
    fast_delivery_enabled boolean DEFAULT false NOT NULL,
    fast_delivery_fee_usd numeric(10,2) DEFAULT 0 NOT NULL,
    billing_exempt boolean DEFAULT false NOT NULL,
    menu_theme_color text,
    allow_guest_checkout boolean DEFAULT false NOT NULL,
    driver_management_enabled boolean DEFAULT false NOT NULL,
    delivers_nationwide boolean DEFAULT false NOT NULL,
    instagram_url text,
    tiktok_url text,
    facebook_url text,
    twitter_url text,
    youtube_url text,
    CONSTRAINT restaurants_lbp_rate_check CHECK ((lbp_rate >= (0)::numeric)),
    CONSTRAINT restaurants_rating_check CHECK (((rating IS NULL) OR ((rating >= (0)::numeric) AND (rating <= (5)::numeric))))
);


ALTER TABLE public.restaurants OWNER TO postgres;

--
-- Name: COLUMN restaurants.delivers_nationwide; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.restaurants.delivers_nationwide IS 'When true, this restaurant delivers everywhere in Lebanon and will appear in all location-based searches regardless of customer location.';


--
-- Name: retail_daily_closes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.retail_daily_closes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    closed_by uuid,
    closed_by_name text DEFAULT 'Admin'::text NOT NULL,
    notes text,
    metrics_snapshot jsonb DEFAULT '{}'::jsonb NOT NULL,
    closed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.retail_daily_closes OWNER TO postgres;

--
-- Name: stock_sync_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_sync_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    menu_item_id uuid,
    direction text NOT NULL,
    sku text,
    quantity integer,
    status text NOT NULL,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT stock_sync_events_direction_check CHECK ((direction = ANY (ARRAY['inbound'::text, 'outbound'::text]))),
    CONSTRAINT stock_sync_events_status_check CHECK ((status = ANY (ARRAY['success'::text, 'error'::text])))
);


ALTER TABLE public.stock_sync_events OWNER TO postgres;

--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    "interval" text NOT NULL,
    price numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT subscription_plans_interval_check CHECK (("interval" = ANY (ARRAY['monthly'::text, 'yearly'::text, 'custom'::text]))),
    CONSTRAINT subscription_plans_price_check CHECK ((price >= (0)::numeric))
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- Name: subscription_reminder_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_reminder_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subscription_id uuid NOT NULL,
    reminder_kind text DEFAULT 'ten_day_expiry'::text NOT NULL,
    due_at date NOT NULL,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT subscription_reminder_log_reminder_kind_check CHECK ((reminder_kind = ANY (ARRAY['ten_day_expiry'::text, 'three_day_expiry'::text, 'expired_deactivated'::text])))
);


ALTER TABLE public.subscription_reminder_log OWNER TO postgres;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    name text NOT NULL,
    contact_name text,
    phone text,
    email text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: table_reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.table_reservations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_id uuid NOT NULL,
    guest_name text NOT NULL,
    guest_phone text NOT NULL,
    guest_email text,
    reservation_date date NOT NULL,
    reservation_time time without time zone NOT NULL,
    party_size integer NOT NULL,
    table_label text,
    status text DEFAULT 'pending'::text NOT NULL,
    special_requests text,
    internal_notes text,
    crm_customer_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT table_reservations_party_size_check CHECK ((party_size > 0)),
    CONSTRAINT table_reservations_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'seated'::text, 'completed'::text, 'cancelled'::text, 'no_show'::text])))
);


ALTER TABLE public.table_reservations OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    role text NOT NULL,
    restaurant_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    must_change_password boolean DEFAULT false NOT NULL,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['superadmin'::text, 'restaurant_admin'::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: COLUMN users.must_change_password; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.must_change_password IS 'True when user must change password on first login (e.g., super admin created account)';


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_08_04; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_08_04 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_08_04 OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_08_05; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_08_05 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_08_05 OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_08_06; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_08_06 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_08_06 OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_08_07; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_08_07 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_08_07 OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_08_08; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_08_08 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_08_08 OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_08_09; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_08_09 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_08_09 OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_08_10; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_08_10 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_08_10 OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    selected_columns text[],
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


ALTER TABLE realtime.subscription OWNER TO supabase_realtime_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- Name: messages_2026_08_04; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_08_04 FOR VALUES FROM ('2026-08-04 00:00:00') TO ('2026-08-05 00:00:00');


--
-- Name: messages_2026_08_05; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_08_05 FOR VALUES FROM ('2026-08-05 00:00:00') TO ('2026-08-06 00:00:00');


--
-- Name: messages_2026_08_06; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_08_06 FOR VALUES FROM ('2026-08-06 00:00:00') TO ('2026-08-07 00:00:00');


--
-- Name: messages_2026_08_07; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_08_07 FOR VALUES FROM ('2026-08-07 00:00:00') TO ('2026-08-08 00:00:00');


--
-- Name: messages_2026_08_08; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_08_08 FOR VALUES FROM ('2026-08-08 00:00:00') TO ('2026-08-09 00:00:00');


--
-- Name: messages_2026_08_09; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_08_09 FOR VALUES FROM ('2026-08-09 00:00:00') TO ('2026-08-10 00:00:00');


--
-- Name: messages_2026_08_10; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_08_10 FOR VALUES FROM ('2026-08-10 00:00:00') TO ('2026-08-11 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at, custom_claims_allowlist) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
52416e99-d310-4bd6-aeda-9abd5850c915	52416e99-d310-4bd6-aeda-9abd5850c915	{"sub": "52416e99-d310-4bd6-aeda-9abd5850c915", "email": "tali-studios@outlook.com", "email_verified": false, "phone_verified": false}	email	2026-04-10 06:03:00.017001+00	2026-04-10 06:03:00.017086+00	2026-04-10 06:03:00.017086+00	27cc5b16-9cdc-47c3-9bf9-f81b7ff76d7e
b8fd536a-8933-4b7e-88b1-644e389e0b40	b8fd536a-8933-4b7e-88b1-644e389e0b40	{"sub": "b8fd536a-8933-4b7e-88b1-644e389e0b40", "email": "wissam8802@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-07-17 14:58:08.700638+00	2026-07-17 14:58:08.700692+00	2026-07-17 14:58:08.700692+00	79f8e631-869d-4132-b8a8-36fad68f279f
0941a5bf-911d-4632-8c78-f267860c6ec4	0941a5bf-911d-4632-8c78-f267860c6ec4	{"sub": "0941a5bf-911d-4632-8c78-f267860c6ec4", "email": "touficmmachaca@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-08-05 11:57:32.255538+00	2026-08-05 11:57:32.255595+00	2026-08-05 11:57:32.255595+00	862534d3-1bf1-4efc-8413-742d0dc62d8e
de486008-f9d9-40cf-a0c1-9ac99a0d714d	de486008-f9d9-40cf-a0c1-9ac99a0d714d	{"sub": "de486008-f9d9-40cf-a0c1-9ac99a0d714d", "email": "abirachedlea480@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-08-10 18:23:17.704786+00	2026-08-10 18:23:17.704845+00	2026-08-10 18:23:17.704845+00	d98ead34-5ca9-41e5-93ba-c87a8d5faf33
ef0030db-b788-4b6a-befb-38f0dbd8f25a	ef0030db-b788-4b6a-befb-38f0dbd8f25a	{"sub": "ef0030db-b788-4b6a-befb-38f0dbd8f25a", "email": "omar.mashaka@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-06-15 12:41:37.799871+00	2026-06-15 12:41:37.799976+00	2026-06-15 12:41:37.799976+00	cc130f75-d74e-4eae-a2a1-c72e8f2664e2
6036533f-6759-4df5-b9e7-2a771d6bc87c	6036533f-6759-4df5-b9e7-2a771d6bc87c	{"sub": "6036533f-6759-4df5-b9e7-2a771d6bc87c", "email": "jabrgaelle@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-06-18 14:05:35.910091+00	2026-06-18 14:05:35.91581+00	2026-06-18 14:05:35.91581+00	37ccc26c-3a02-4b6d-8c44-b75d2d6e198d
eb8a6434-b253-42fb-adbb-f508307c236b	eb8a6434-b253-42fb-adbb-f508307c236b	{"sub": "eb8a6434-b253-42fb-adbb-f508307c236b", "email": "wissam.baaklini123@icloud.com", "email_verified": false, "phone_verified": false}	email	2026-07-09 19:06:21.829624+00	2026-07-09 19:06:21.829686+00	2026-07-09 19:06:21.829686+00	b559364b-21f0-4950-a894-cb773d970953
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
65f2e051-fedb-4665-ad14-88d510266833	2026-07-24 06:36:31.974562+00	2026-07-24 06:36:31.974562+00	password	8245a946-72f2-407f-ace8-690f74bd6206
b6b38a4b-29b5-4812-af75-3c545972f524	2026-07-28 13:21:53.180635+00	2026-07-28 13:21:53.180635+00	password	093946fa-bcfc-4caf-afa1-5cdfc0a3b1a1
174d9a90-14ad-45b5-b088-4c159606041f	2026-07-28 14:04:59.327524+00	2026-07-28 14:04:59.327524+00	password	10ee43fc-c3dd-41c5-bd17-81dac25c4640
43db0db8-3048-417c-9e3a-8aa4ef346de1	2026-06-15 12:42:23.460215+00	2026-06-15 12:42:23.460215+00	password	5c85ad4d-aad6-4b23-ac03-c10fe24f2244
eb777c23-e89e-4b4d-9e93-9405d2903691	2026-06-15 12:42:25.059666+00	2026-06-15 12:42:25.059666+00	password	db88024a-6860-4aa4-998f-84c3bb437662
33ced43f-2c06-474c-8892-e89aaee299b5	2026-08-05 16:19:21.219127+00	2026-08-05 16:19:21.219127+00	password	02ecfc9c-f6f3-4c2f-88f6-23ba23a2625f
16ca6864-fcc9-4ebb-b584-403994737067	2026-08-12 12:34:32.794733+00	2026-08-12 12:34:32.794733+00	password	46516022-d3d4-42da-89d8-77a706c1e274
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	397	5ndzwywtndz5	ef0030db-b788-4b6a-befb-38f0dbd8f25a	t	2026-06-16 11:57:07.871209+00	2026-06-18 16:19:21.454765+00	btjkreiqnaxv	eb777c23-e89e-4b4d-9e93-9405d2903691
00000000-0000-0000-0000-000000000000	718	ilisrt2rukwg	eb8a6434-b253-42fb-adbb-f508307c236b	t	2026-07-29 15:50:52.547822+00	2026-08-04 09:23:06.229297+00	2kr4gk7e7ywc	65f2e051-fedb-4665-ad14-88d510266833
00000000-0000-0000-0000-000000000000	741	24c5pqvqslxd	eb8a6434-b253-42fb-adbb-f508307c236b	t	2026-08-10 12:36:38.286324+00	2026-08-11 12:53:06.840739+00	44h4xnh7jwwn	33ced43f-2c06-474c-8892-e89aaee299b5
00000000-0000-0000-0000-000000000000	719	sdinxdm2ouc6	6036533f-6759-4df5-b9e7-2a771d6bc87c	t	2026-08-03 11:13:08.677737+00	2026-08-05 02:49:33.604823+00	7jbvsksdumoy	b6b38a4b-29b5-4812-af75-3c545972f524
00000000-0000-0000-0000-000000000000	494	dl4nosihbd6e	ef0030db-b788-4b6a-befb-38f0dbd8f25a	t	2026-06-22 05:29:47.072629+00	2026-06-23 11:33:50.355447+00	ts4cavbsiain	eb777c23-e89e-4b4d-9e93-9405d2903691
00000000-0000-0000-0000-000000000000	506	bszfn56dcldu	ef0030db-b788-4b6a-befb-38f0dbd8f25a	f	2026-06-23 11:33:50.376282+00	2026-06-23 11:33:50.376282+00	dl4nosihbd6e	eb777c23-e89e-4b4d-9e93-9405d2903691
00000000-0000-0000-0000-000000000000	726	jzzlq632lfnk	eb8a6434-b253-42fb-adbb-f508307c236b	t	2026-08-04 09:23:06.234712+00	2026-08-05 12:00:57.720023+00	ilisrt2rukwg	65f2e051-fedb-4665-ad14-88d510266833
00000000-0000-0000-0000-000000000000	730	navlyzl7mcy7	eb8a6434-b253-42fb-adbb-f508307c236b	f	2026-08-05 12:00:57.730787+00	2026-08-05 12:00:57.730787+00	jzzlq632lfnk	65f2e051-fedb-4665-ad14-88d510266833
00000000-0000-0000-0000-000000000000	778	fps7nnthy2yt	eb8a6434-b253-42fb-adbb-f508307c236b	t	2026-08-11 12:53:06.847147+00	2026-08-11 14:04:56.489177+00	24c5pqvqslxd	33ced43f-2c06-474c-8892-e89aaee299b5
00000000-0000-0000-0000-000000000000	735	mqfykrukogha	eb8a6434-b253-42fb-adbb-f508307c236b	t	2026-08-05 16:19:21.214366+00	2026-08-07 14:31:10.799876+00	\N	33ced43f-2c06-474c-8892-e89aaee299b5
00000000-0000-0000-0000-000000000000	728	cnongchnjzil	6036533f-6759-4df5-b9e7-2a771d6bc87c	t	2026-08-05 02:49:33.629725+00	2026-08-07 14:32:34.609647+00	sdinxdm2ouc6	b6b38a4b-29b5-4812-af75-3c545972f524
00000000-0000-0000-0000-000000000000	738	byendarafv6n	6036533f-6759-4df5-b9e7-2a771d6bc87c	f	2026-08-07 14:32:34.61988+00	2026-08-07 14:32:34.61988+00	cnongchnjzil	b6b38a4b-29b5-4812-af75-3c545972f524
00000000-0000-0000-0000-000000000000	781	tjqvnbf5k3eb	eb8a6434-b253-42fb-adbb-f508307c236b	t	2026-08-11 14:04:56.508794+00	2026-08-11 21:15:09.435654+00	fps7nnthy2yt	33ced43f-2c06-474c-8892-e89aaee299b5
00000000-0000-0000-0000-000000000000	737	44h4xnh7jwwn	eb8a6434-b253-42fb-adbb-f508307c236b	t	2026-08-07 14:31:10.822385+00	2026-08-10 12:36:38.261246+00	mqfykrukogha	33ced43f-2c06-474c-8892-e89aaee299b5
00000000-0000-0000-0000-000000000000	785	q77ujjbwnvfq	eb8a6434-b253-42fb-adbb-f508307c236b	t	2026-08-11 21:15:09.456259+00	2026-08-12 06:48:50.616101+00	tjqvnbf5k3eb	33ced43f-2c06-474c-8892-e89aaee299b5
00000000-0000-0000-0000-000000000000	786	dnhynirepkpy	eb8a6434-b253-42fb-adbb-f508307c236b	t	2026-08-12 06:48:50.640301+00	2026-08-12 12:31:55.283413+00	q77ujjbwnvfq	33ced43f-2c06-474c-8892-e89aaee299b5
00000000-0000-0000-0000-000000000000	703	d2o6kbvlyeze	eb8a6434-b253-42fb-adbb-f508307c236b	t	2026-07-24 06:36:31.940824+00	2026-07-24 10:01:15.954646+00	\N	65f2e051-fedb-4665-ad14-88d510266833
00000000-0000-0000-0000-000000000000	392	7ml36lg6fmsz	ef0030db-b788-4b6a-befb-38f0dbd8f25a	f	2026-06-15 12:42:23.456887+00	2026-06-15 12:42:23.456887+00	\N	43db0db8-3048-417c-9e3a-8aa4ef346de1
00000000-0000-0000-0000-000000000000	789	mmpboxepiyg5	de486008-f9d9-40cf-a0c1-9ac99a0d714d	t	2026-08-12 12:34:32.767057+00	2026-08-12 13:34:09.515558+00	\N	16ca6864-fcc9-4ebb-b584-403994737067
00000000-0000-0000-0000-000000000000	705	q7doqtywtx7r	eb8a6434-b253-42fb-adbb-f508307c236b	t	2026-07-24 10:01:15.974759+00	2026-07-25 05:31:56.676297+00	d2o6kbvlyeze	65f2e051-fedb-4665-ad14-88d510266833
00000000-0000-0000-0000-000000000000	393	tbdd2ezrqjjx	ef0030db-b788-4b6a-befb-38f0dbd8f25a	t	2026-06-15 12:42:25.058206+00	2026-06-15 16:02:42.637468+00	\N	eb777c23-e89e-4b4d-9e93-9405d2903691
00000000-0000-0000-0000-000000000000	706	4yazv6mkzmp7	eb8a6434-b253-42fb-adbb-f508307c236b	t	2026-07-25 05:31:56.69847+00	2026-07-28 13:13:22.337737+00	q7doqtywtx7r	65f2e051-fedb-4665-ad14-88d510266833
00000000-0000-0000-0000-000000000000	790	d334qtc5iata	de486008-f9d9-40cf-a0c1-9ac99a0d714d	t	2026-08-12 13:34:09.538022+00	2026-08-12 19:19:23.968952+00	mmpboxepiyg5	16ca6864-fcc9-4ebb-b584-403994737067
00000000-0000-0000-0000-000000000000	395	btjkreiqnaxv	ef0030db-b788-4b6a-befb-38f0dbd8f25a	t	2026-06-15 16:02:42.663925+00	2026-06-16 11:57:07.849615+00	tbdd2ezrqjjx	eb777c23-e89e-4b4d-9e93-9405d2903691
00000000-0000-0000-0000-000000000000	792	mvb7uefcu537	de486008-f9d9-40cf-a0c1-9ac99a0d714d	t	2026-08-12 19:19:23.987941+00	2026-08-12 20:20:07.931037+00	d334qtc5iata	16ca6864-fcc9-4ebb-b584-403994737067
00000000-0000-0000-0000-000000000000	710	lwr5p7i4ti5o	6036533f-6759-4df5-b9e7-2a771d6bc87c	t	2026-07-28 13:21:53.176183+00	2026-07-28 14:26:31.7582+00	\N	b6b38a4b-29b5-4812-af75-3c545972f524
00000000-0000-0000-0000-000000000000	712	tn45d6lpuv2m	6036533f-6759-4df5-b9e7-2a771d6bc87c	t	2026-07-28 14:26:31.764056+00	2026-07-28 16:06:09.442225+00	lwr5p7i4ti5o	b6b38a4b-29b5-4812-af75-3c545972f524
00000000-0000-0000-0000-000000000000	787	s3enwjuq4wg7	eb8a6434-b253-42fb-adbb-f508307c236b	t	2026-08-12 12:31:55.30289+00	2026-08-13 07:57:24.646977+00	dnhynirepkpy	33ced43f-2c06-474c-8892-e89aaee299b5
00000000-0000-0000-0000-000000000000	711	3dhqnzvsaspy	6036533f-6759-4df5-b9e7-2a771d6bc87c	t	2026-07-28 14:04:59.291316+00	2026-07-28 16:42:13.284739+00	\N	174d9a90-14ad-45b5-b088-4c159606041f
00000000-0000-0000-0000-000000000000	714	sa5ow6pxpbjo	6036533f-6759-4df5-b9e7-2a771d6bc87c	f	2026-07-28 16:42:13.291077+00	2026-07-28 16:42:13.291077+00	3dhqnzvsaspy	174d9a90-14ad-45b5-b088-4c159606041f
00000000-0000-0000-0000-000000000000	794	oelbwse4ksrt	eb8a6434-b253-42fb-adbb-f508307c236b	f	2026-08-13 07:57:24.674036+00	2026-08-13 07:57:24.674036+00	s3enwjuq4wg7	33ced43f-2c06-474c-8892-e89aaee299b5
00000000-0000-0000-0000-000000000000	793	ttqy5ppgmaai	de486008-f9d9-40cf-a0c1-9ac99a0d714d	t	2026-08-12 20:20:07.950326+00	2026-08-13 09:34:41.947197+00	mvb7uefcu537	16ca6864-fcc9-4ebb-b584-403994737067
00000000-0000-0000-0000-000000000000	795	4aqbluyut4yc	de486008-f9d9-40cf-a0c1-9ac99a0d714d	f	2026-08-13 09:34:41.971304+00	2026-08-13 09:34:41.971304+00	ttqy5ppgmaai	16ca6864-fcc9-4ebb-b584-403994737067
00000000-0000-0000-0000-000000000000	707	2kr4gk7e7ywc	eb8a6434-b253-42fb-adbb-f508307c236b	t	2026-07-28 13:13:22.358709+00	2026-07-29 15:50:52.529115+00	4yazv6mkzmp7	65f2e051-fedb-4665-ad14-88d510266833
00000000-0000-0000-0000-000000000000	713	7jbvsksdumoy	6036533f-6759-4df5-b9e7-2a771d6bc87c	t	2026-07-28 16:06:09.458705+00	2026-08-03 11:13:08.654441+00	tn45d6lpuv2m	b6b38a4b-29b5-4812-af75-3c545972f524
00000000-0000-0000-0000-000000000000	446	ts4cavbsiain	ef0030db-b788-4b6a-befb-38f0dbd8f25a	t	2026-06-18 16:19:21.462084+00	2026-06-22 05:29:47.049728+00	5ndzwywtndz5	eb777c23-e89e-4b4d-9e93-9405d2903691
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
20260625000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
eb777c23-e89e-4b4d-9e93-9405d2903691	ef0030db-b788-4b6a-befb-38f0dbd8f25a	2026-06-15 12:42:25.055807+00	2026-06-23 11:33:50.40669+00	\N	aal1	\N	2026-06-23 11:33:50.406586	node	18.133.253.174	\N	\N	\N	\N	\N
b6b38a4b-29b5-4812-af75-3c545972f524	6036533f-6759-4df5-b9e7-2a771d6bc87c	2026-07-28 13:21:53.172563+00	2026-08-07 14:32:36.18534+00	\N	aal1	\N	2026-08-07 14:32:36.185251	node	35.176.198.89	\N	\N	\N	\N	\N
43db0db8-3048-417c-9e3a-8aa4ef346de1	ef0030db-b788-4b6a-befb-38f0dbd8f25a	2026-06-15 12:42:23.447824+00	2026-06-15 12:42:23.447824+00	\N	aal1	\N	\N	node	52.202.169.57	\N	\N	\N	\N	\N
174d9a90-14ad-45b5-b088-4c159606041f	6036533f-6759-4df5-b9e7-2a771d6bc87c	2026-07-28 14:04:59.263129+00	2026-07-28 16:42:13.304968+00	\N	aal1	\N	2026-07-28 16:42:13.304863	node	18.171.167.135	\N	\N	\N	\N	\N
33ced43f-2c06-474c-8892-e89aaee299b5	eb8a6434-b253-42fb-adbb-f508307c236b	2026-08-05 16:19:21.210627+00	2026-08-13 07:57:24.823367+00	\N	aal1	\N	2026-08-13 07:57:24.823266	node	13.42.19.180	\N	\N	\N	\N	\N
16ca6864-fcc9-4ebb-b584-403994737067	de486008-f9d9-40cf-a0c1-9ac99a0d714d	2026-08-12 12:34:32.728656+00	2026-08-13 09:34:41.995987+00	\N	aal1	\N	2026-08-13 09:34:41.995868	node	213.204.117.231	\N	\N	\N	\N	\N
65f2e051-fedb-4665-ad14-88d510266833	eb8a6434-b253-42fb-adbb-f508307c236b	2026-07-24 06:36:31.899672+00	2026-08-05 12:00:58.098327+00	\N	aal1	\N	2026-08-05 12:00:58.098235	node	18.130.252.155	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	ef0030db-b788-4b6a-befb-38f0dbd8f25a	authenticated	authenticated	omar.mashaka@gmail.com	$2a$10$sWT642Uzz/sosY9M0isdauLy9pi5xC7nmJUEHqi6KJhtvqDthkxYy	2026-06-15 12:42:19.10251+00	\N		\N		\N			\N	2026-06-15 12:42:25.055717+00	{"provider": "email", "providers": ["email"]}	{"name": "Omar Mashaka", "email_verified": true}	\N	2026-06-15 12:41:37.769304+00	2026-06-23 11:33:50.392509+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	52416e99-d310-4bd6-aeda-9abd5850c915	authenticated	authenticated	tali-studios@outlook.com	$2a$10$Gf/Pr4MVQMsreYw3YCvZEOsbEKgEzXLix7ot.LbUOoWLHq2zDjDzu	2026-04-10 06:03:00.024628+00	\N		\N		\N			\N	2026-08-10 18:25:40.082685+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-04-10 06:03:00.008004+00	2026-08-10 18:25:40.09294+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	b8fd536a-8933-4b7e-88b1-644e389e0b40	authenticated	authenticated	wissam8802@gmail.com	$2a$10$rkOkOfo413vPjg8lwRBCweSaDVHKM1zpJykDP4qEg1FTMWLdOBrJ6	2026-07-17 14:58:08.705344+00	\N		\N		\N			\N	2026-08-11 14:24:49.669171+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-07-17 14:58:08.684222+00	2026-08-12 14:01:29.671555+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	eb8a6434-b253-42fb-adbb-f508307c236b	authenticated	authenticated	wissam.baaklini123@icloud.com	$2a$10$siL4QkRSA.oSyELmtGToxO1R2zaGLgb2nqyFU/sp.zjAXrbUTi6iK	2026-07-09 19:07:10.115121+00	\N		\N		\N			\N	2026-08-05 16:19:21.209368+00	{"provider": "email", "providers": ["email"]}	{"name": "Wissam Walid Baaklini", "phone": "+96171212734", "email_verified": true}	\N	2026-07-09 19:06:21.804027+00	2026-08-13 07:57:24.690216+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	de486008-f9d9-40cf-a0c1-9ac99a0d714d	authenticated	authenticated	abirachedlea480@gmail.com	$2a$10$B/lIlA53GlAsqL7i/2u9C.sfbVG0FgllTzUJQcVPUcUt8pzRV7Vq2	2026-08-10 18:23:17.71227+00	\N		\N		\N			\N	2026-08-12 12:34:32.727129+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-10 18:23:17.689415+00	2026-08-13 09:34:41.983666+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	0941a5bf-911d-4632-8c78-f267860c6ec4	authenticated	authenticated	touficmmachaca@gmail.com	$2a$10$7M6o0RoxAjdcIqaVK0c0iOzBSi14ltap/hIUB5lAI87As9zbmLa2.	2026-08-05 11:57:32.267392+00	\N		\N		\N			\N	2026-08-06 13:14:39.293437+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-05 11:57:32.240692+00	2026-08-06 13:14:39.33694+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	6036533f-6759-4df5-b9e7-2a771d6bc87c	authenticated	authenticated	jabrgaelle@gmail.com	$2a$10$smGA3hyyjQtEvZabYJ3fpOf2qVvb4fWSuSdpnJGerZHR5tvZK7TV6	2026-07-28 13:21:44.989892+00	\N		\N		\N			\N	2026-07-28 14:04:59.259424+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-06-18 14:05:35.88757+00	2026-08-07 14:32:34.629516+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: accounting_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounting_expenses (id, restaurant_id, category, amount, occurred_at, vendor, reference, notes, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, restaurant_id, name, "position", created_at) FROM stdin;
232d22be-7e2d-4d0f-81b0-7462df564707	5eb1ce0e-c35c-44b6-80fe-12b921849ce1	T-shirts	6	2026-08-11 13:06:08.142896+00
8b1d4cd3-b4d5-448d-9165-8fd3987f8704	5eb1ce0e-c35c-44b6-80fe-12b921849ce1	Shoes	3	2026-08-10 18:30:12.585364+00
0a005031-7fe3-479c-a403-1b9f67b935b7	5eb1ce0e-c35c-44b6-80fe-12b921849ce1	Accessories	5	2026-08-10 18:30:12.585364+00
aefea013-f521-4949-a714-4565bd962c8a	5eb1ce0e-c35c-44b6-80fe-12b921849ce1	Perfumes	7	2026-08-12 20:06:40.686403+00
7aee95af-8c26-4f7b-b34b-a7a538d362f7	5eb1ce0e-c35c-44b6-80fe-12b921849ce1	Towels	8	2026-08-12 20:34:37.530144+00
e26f64a9-8e5b-4032-becb-e18c1b96c89d	897ac3c7-ee4e-41cf-bd51-c7996fc51614	Daily Dishes	0	2026-06-18 15:56:25.727146+00
a4546dfc-afdd-469b-aad6-db244a242b89	897ac3c7-ee4e-41cf-bd51-c7996fc51614	Salads & Appetizers	0	2026-06-18 15:56:52.006867+00
5818f56a-435a-49a9-bcac-bd0ea2527dc6	897ac3c7-ee4e-41cf-bd51-c7996fc51614	Wraps & Sandwiches	0	2026-06-18 15:57:38.786572+00
a1f77858-9ea9-446f-9d66-37bfc457c9d2	897ac3c7-ee4e-41cf-bd51-c7996fc51614	Burgers	0	2026-06-18 15:57:53.833273+00
fb051d4c-09b1-4eac-b35e-6207ddd7d444	897ac3c7-ee4e-41cf-bd51-c7996fc51614	Pizzas	0	2026-06-18 15:58:18.921832+00
259a4ab8-f567-41ee-b216-56131327a467	d01685dd-bb48-4728-b14b-cd379b3939a5	Breakfast	0	2026-07-17 15:38:31.594468+00
deef2b80-4353-4e66-8186-b8b8ab90eb68	d01685dd-bb48-4728-b14b-cd379b3939a5	Wraps & Sandwiches	1	2026-07-17 15:38:31.594468+00
9173975f-ec3c-4b88-9f0d-fe3596b3adba	d01685dd-bb48-4728-b14b-cd379b3939a5	Coffee & Hot Drinks	2	2026-07-17 15:38:31.594468+00
c2dc8b2c-6375-49d6-b221-da2dc2aaea1d	d01685dd-bb48-4728-b14b-cd379b3939a5	Cold Drinks	3	2026-07-17 15:38:31.594468+00
86270056-4271-47df-b6ff-78ba3cef17c1	d01685dd-bb48-4728-b14b-cd379b3939a5	Bakery & Deserts	4	2026-07-17 15:38:31.594468+00
795a633b-7745-4887-ae94-ec1cbbe13230	897ac3c7-ee4e-41cf-bd51-c7996fc51614	Cold Beverages	1	2026-07-28 13:45:18.718627+00
bf3c05da-0994-4284-b27a-9f18e15ba4db	5eb1ce0e-c35c-44b6-80fe-12b921849ce1	Pants	0	2026-08-10 18:30:12.585364+00
8c0e0109-32d0-4eb2-aa69-d213ded9d17e	5eb1ce0e-c35c-44b6-80fe-12b921849ce1	Tops	1	2026-08-10 18:30:12.585364+00
5f23cf37-aae8-4744-80c9-cebcbee1eb75	5eb1ce0e-c35c-44b6-80fe-12b921849ce1	Dresses	2	2026-08-10 18:30:12.585364+00
\.


--
-- Data for Name: club_check_ins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.club_check_ins (id, restaurant_id, member_id, guests_count, notes, checked_in_by, checked_in_at) FROM stdin;
\.


--
-- Data for Name: club_invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.club_invoices (id, restaurant_id, member_id, invoice_number, period_start, period_end, amount, status, paid_at, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: club_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.club_members (id, restaurant_id, plan_id, full_name, phone, email, photo_url, member_number, joined_at, expiry_date, status, total_visits, total_spent, crm_customer_id, loyalty_member_id, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: club_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.club_plans (id, restaurant_id, name, description, price, billing_cycle, duration_days, max_guests, benefits, color, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_customer_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.crm_customer_notes (id, restaurant_id, customer_id, content, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: crm_customer_tag_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.crm_customer_tag_assignments (id, customer_id, tag_id, assigned_at) FROM stdin;
\.


--
-- Data for Name: crm_customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.crm_customers (id, restaurant_id, full_name, phone, email, birthday, is_vip, total_spend, visit_count, first_visit_at, last_visit_at, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.crm_tags (id, restaurant_id, name, color, created_at) FROM stdin;
\.


--
-- Data for Name: customer_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_addresses (id, customer_id, label, nickname, latitude, longitude, formatted_address, street, building, apartment, phone, driver_notes, is_default, created_at, country_code, voice_directions_url, address_photo_urls) FROM stdin;
dfc9e7c8-6dfa-4871-9c10-ddeafaf49256	eb8a6434-b253-42fb-adbb-f508307c236b	home	Home	33.83636608768007	35.53106134737314	RGPJ+GGR, Hadath, Lebanon	\N	Maroun Baaklini building	1st	71212734	\N	t	2026-07-18 12:52:50.705868+00	+961	\N	{}
\.


--
-- Data for Name: customer_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_profiles (id, name, email, created_at, updated_at, phone, country_code) FROM stdin;
ef0030db-b788-4b6a-befb-38f0dbd8f25a	Omar Mashaka	omar.mashaka@gmail.com	2026-06-15 12:41:38.318972+00	2026-06-15 12:41:38.318972+00	\N	+961
eb8a6434-b253-42fb-adbb-f508307c236b	Wissam Walid Baaklini	wissam.baaklini123@icloud.com	2026-07-09 19:06:22.452593+00	2026-07-09 19:06:22.452593+00	71212734	+961
\.


--
-- Data for Name: customer_signup_otps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_signup_otps (id, user_id, otp_hash, expires_at, used_at, created_at) FROM stdin;
56a88b6c-cf97-47e3-825a-f64826794c39	ef0030db-b788-4b6a-befb-38f0dbd8f25a	77cda927647cf335ce016a627b0b21533ebdc41868859108a5457f910d6da706	2026-06-15 12:51:38.487+00	2026-06-15 12:42:18.299+00	2026-06-15 12:41:38.897181+00
cb5b81c1-3485-4f40-86f1-7718f6bc6fa7	eb8a6434-b253-42fb-adbb-f508307c236b	06df3f88c6740de8f48bad40ee72805595431e9fe321981ba22ac5dc584c020d	2026-07-09 19:16:22.794+00	2026-07-09 19:07:09.779+00	2026-07-09 19:06:23.233602+00
\.


--
-- Data for Name: ecommerce_delivery_zones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ecommerce_delivery_zones (id, restaurant_id, zone_name, delivery_fee, min_order, est_mins, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: ecommerce_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ecommerce_order_items (id, order_id, restaurant_id, menu_item_id, item_name, quantity, unit_price, line_total, special_request, created_at) FROM stdin;
\.


--
-- Data for Name: ecommerce_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ecommerce_orders (id, restaurant_id, order_number, customer_name, customer_phone, customer_email, delivery_address, delivery_zone_id, fulfilment_type, status, payment_method, payment_status, subtotal, delivery_fee, tax_amount, total_amount, notes, crm_customer_id, confirmed_at, delivered_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ecommerce_stores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ecommerce_stores (id, restaurant_id, store_name, tagline, is_open, delivery_enabled, pickup_enabled, min_order_amount, base_delivery_fee, estimated_delivery_mins, estimated_pickup_mins, accepts_cash, accepts_card, accepts_online, tax_rate, operating_hours, closed_message, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: event_booking_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_booking_packages (id, booking_id, package_id, package_name, quantity, unit_price, line_total, created_at) FROM stdin;
\.


--
-- Data for Name: event_bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_bookings (id, restaurant_id, space_id, reference_number, organiser_name, organiser_phone, organiser_email, organisation, event_name, event_type, event_date, start_time, end_time, guest_count, status, space_fee, packages_total, extras_total, total_amount, deposit_amount, deposit_paid_at, special_requests, internal_notes, crm_customer_id, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: event_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_packages (id, restaurant_id, name, description, price, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: event_spaces; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_spaces (id, restaurant_id, name, description, capacity_min, capacity_max, pricing_type, base_price, currency, amenities, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: fleet_deliveries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fleet_deliveries (id, restaurant_id, driver_id, vehicle_id, pos_order_id, ecommerce_order_id, customer_name, customer_phone, delivery_address, status, assigned_at, picked_up_at, delivered_at, distance_km, delivery_fee, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: fleet_drivers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fleet_drivers (id, restaurant_id, full_name, phone, license_number, license_expiry, vehicle_id, status, notes, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: fleet_vehicle_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fleet_vehicle_logs (id, restaurant_id, vehicle_id, log_type, description, amount, odometer_km, log_date, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: fleet_vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fleet_vehicles (id, restaurant_id, plate_number, make, model, vehicle_type, year, color, status, insurance_expiry, notes, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: gym_member_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gym_member_packages (id, restaurant_id, club_member_id, member_name, member_phone, package_id, purchased_sessions, used_sessions, remaining_sessions, purchase_date, expiry_date, status, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: gym_pt_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gym_pt_packages (id, restaurant_id, name, session_count, price, valid_days, description, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: gym_pt_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gym_pt_sessions (id, restaurant_id, trainer_id, member_name, member_phone, package_id, session_type, status, scheduled_at, duration_mins, price, payment_status, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: gym_trainer_payouts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gym_trainer_payouts (id, restaurant_id, trainer_id, period_start, period_end, base_amount, session_amount, bonus_amount, total_amount, status, paid_at, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: gym_trainers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gym_trainers (id, restaurant_id, full_name, phone, email, specialty, employment_type, salary_type, base_salary, session_rate, is_active, hire_date, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_items (id, restaurant_id, supplier_id, name, sku, unit, current_qty, min_qty, cost_per_unit, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_movements (id, restaurant_id, item_id, movement_type, qty, unit_cost, reference, notes, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, restaurant_id, subscription_id, period_start, period_end, amount_due, amount_paid, status, due_at, paid_at, notes, created_at) FROM stdin;
47bf29de-20eb-424e-bccf-2dee49b7b710	d01685dd-bb48-4728-b14b-cd379b3939a5	ca6aa64a-9049-47a4-8f48-8bf5e9b62493	2026-07-17	2026-08-17	10.00	0.00	unpaid	2026-08-17 14:58:10.078+00	\N	Initial subscription period invoice.	2026-07-17 14:58:11.571579+00
\.


--
-- Data for Name: loyalty_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loyalty_members (id, restaurant_id, crm_customer_id, phone, email, full_name, points_balance, stamps_balance, total_stamps_ever, lifetime_points, tier, is_active, enrolled_at, last_activity_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: loyalty_programs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loyalty_programs (id, restaurant_id, points_enabled, points_per_dollar, points_redeem_per_dollar, stamps_enabled, stamps_required, stamp_reward_desc, referral_enabled, referral_bonus_points, tiers_enabled, tier_silver_threshold, tier_gold_threshold, tier_platinum_threshold, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: loyalty_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loyalty_transactions (id, restaurant_id, member_id, pos_order_id, type, points_delta, stamps_delta, description, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: menu_brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_brands (id, restaurant_id, name, logo_url, "position", created_at) FROM stdin;
8a502252-3b55-444c-a759-d0d210a221a1	d01685dd-bb48-4728-b14b-cd379b3939a5	Rim	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/d01685dd-bb48-4728-b14b-cd379b3939a5/brand-1784302718160-bc5e5ac9-ef1e-4452-8474-922d8e656fdc.jpeg	0	2026-07-17 15:38:39.011472+00
\.


--
-- Data for Name: menu_coupon_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_coupon_codes (id, restaurant_id, code, percent_off, max_uses, times_used, starts_at, ends_at, is_active, created_at, updated_at) FROM stdin;
412c5d60-794c-4375-bee1-19809fdaad52	d01685dd-bb48-4728-b14b-cd379b3939a5	SUMMER20	15.00	100	0	2026-07-17 23:30:00+00	2026-07-31 23:30:00+00	t	2026-07-17 18:31:46.177369+00	2026-07-17 18:31:46.177369+00
\.


--
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available, created_at, contents, grams, removable_ingredients, add_ingredients, option_label, option_values, sold_by_weight, price_per_kg, weight_step_kg, brand_name, brand_id, display_quantity, display_unit, calories, protein_g, track_stock, stock_quantity, stock_alert_warning_qty, stock_alert_urgent_qty, stock_alert_critical_qty, stock_alert_warning_sent_at, stock_alert_urgent_sent_at, stock_alert_critical_sent_at, stock_alert_out_sent_at, external_sku, option_variant_stock, audience) FROM stdin;
7ce8017c-f91b-429c-b2a0-9fba72afb8ad	897ac3c7-ee4e-41cf-bd51-c7996fc51614	a4546dfc-afdd-469b-aad6-db244a242b89	Fries	\N	3.00	\N	t	2026-06-20 20:57:17.17243+00	\N	\N	[]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
f45af2d1-4eb1-4cd6-b08f-704ba0d7ce39	d01685dd-bb48-4728-b14b-cd379b3939a5	259a4ab8-f567-41ee-b216-56131327a467	Eggs	Pan of eggs served with toast.	5.50	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/d01685dd-bb48-4728-b14b-cd379b3939a5/1784303587580-dccd55f9-cc99-4beb-88eb-470b78e049af.png	t	2026-07-17 15:53:10.658256+00	\N	\N	[]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	220	18.00	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
db03ae04-2da5-4c18-a798-4a9dbb7df918	d01685dd-bb48-4728-b14b-cd379b3939a5	259a4ab8-f567-41ee-b216-56131327a467	Omelet	\N	7.00	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/d01685dd-bb48-4728-b14b-cd379b3939a5/1784303818138-2267e208-275f-47db-903a-b613938f3189.png	t	2026-07-17 15:57:01.077427+00	\N	\N	[]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
380103b5-fc44-450a-ac21-57a12a5a845b	d01685dd-bb48-4728-b14b-cd379b3939a5	deef2b80-4353-4e66-8186-b8b8ab90eb68	Chicken Wrap	\N	8.50	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/d01685dd-bb48-4728-b14b-cd379b3939a5/1784303903128-bf7be926-cb26-4a4d-b939-26d826967638.png	t	2026-07-17 15:58:25.66888+00	\N	\N	[{"name": "Lettuce"}, {"name": "tomato"}, {"name": "Mayo"}]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	42.00	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
a033f945-56d4-4208-9dab-e34d1a8ca65e	897ac3c7-ee4e-41cf-bd51-c7996fc51614	5818f56a-435a-49a9-bcac-bd0ea2527dc6	CheeseSteak Sandwich	Tender slices of sautéed beef with melted cheese, grilled onions, and peppers.	8.00	\N	t	2026-06-20 21:03:48.741368+00	\N	\N	[{"name": "Peppers"}, {"name": "Onion"}]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
300c34b4-925c-4071-8091-fb083e73957c	d01685dd-bb48-4728-b14b-cd379b3939a5	deef2b80-4353-4e66-8186-b8b8ab90eb68	Club Sandwish	\N	12.00	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/d01685dd-bb48-4728-b14b-cd379b3939a5/1784303941061-28586573-b844-4aa5-a8db-587ef0b4084e.png	t	2026-07-17 15:59:03.261959+00	\N	\N	[]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
a9720546-1cc7-4646-ac67-af33d2e41dd0	d01685dd-bb48-4728-b14b-cd379b3939a5	9173975f-ec3c-4b88-9f0d-fe3596b3adba	Espresso	\N	2.50	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/d01685dd-bb48-4728-b14b-cd379b3939a5/1784303984800-a06f4e2f-0974-4158-9338-932e57a8dda8.png	t	2026-07-17 15:59:47.200113+00	\N	\N	[]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
8bf016c3-b99f-4c60-9da9-5f01e5cee6a5	897ac3c7-ee4e-41cf-bd51-c7996fc51614	fb051d4c-09b1-4eac-b35e-6207ddd7d444	Pepperoni Pizza	\N	12.00	\N	t	2026-07-28 13:33:32.569412+00	\N	\N	[]	[{"name": "Pepperoni", "price": 2}]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
195c4a27-860f-4b1e-8049-209bd3203b2f	897ac3c7-ee4e-41cf-bd51-c7996fc51614	a4546dfc-afdd-469b-aad6-db244a242b89	Mac & Cheese Balls	Our creamy mac & cheese breaded and fried to golden perfection for the perfect bite-sized side dish, served with marinara sauce	7.00	\N	t	2026-06-20 21:07:48.505976+00	\N	\N	[]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
d792e142-1d36-4693-ae9c-f9fb99f670ef	897ac3c7-ee4e-41cf-bd51-c7996fc51614	a4546dfc-afdd-469b-aad6-db244a242b89	Caesar Salad	\N	6.00	\N	t	2026-07-28 13:53:04.177491+00	\N	\N	[]	[{"name": "Chicken", "price": 3}]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
29201d67-df17-4230-99fe-fe42776ea775	897ac3c7-ee4e-41cf-bd51-c7996fc51614	fb051d4c-09b1-4eac-b35e-6207ddd7d444	Lokmati Lebanese Pizza	Lebanese Pizza with Ham, Mushroom and Olives	12.00	\N	t	2026-06-20 21:13:07.016933+00	\N	\N	[{"name": "Mushroom"}, {"name": "Olives"}]	[{"name": "Replace Ham by Turkey", "price": 0}]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
9a01860b-7a2a-41f3-8e88-24944addf3d2	897ac3c7-ee4e-41cf-bd51-c7996fc51614	a4546dfc-afdd-469b-aad6-db244a242b89	Chicken Tenders	4 pcs of crispy chicken tenders served with our homemade honey mustard sauce.	7.00	\N	t	2026-06-20 21:06:50.40983+00	\N	\N	[]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
9f59aed5-2626-49f8-a129-9b137786716a	d01685dd-bb48-4728-b14b-cd379b3939a5	86270056-4271-47df-b6ff-78ba3cef17c1	Croissant	\N	4.50	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/d01685dd-bb48-4728-b14b-cd379b3939a5/1784304044575-719cba43-8fef-4787-934e-74d315c8f890.png	t	2026-07-17 16:00:47.114979+00	\N	\N	[]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
0de0b200-b32d-4176-b1bb-c3fe97248cf4	d01685dd-bb48-4728-b14b-cd379b3939a5	c2dc8b2c-6375-49d6-b221-da2dc2aaea1d	Orange Juice	\N	4.00	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/d01685dd-bb48-4728-b14b-cd379b3939a5/1784304082665-bd9e950a-7e5a-41a2-aafb-c56de18168be.png	t	2026-07-17 16:01:24.451572+00	\N	\N	[]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
07110955-8563-47a4-861b-b063d00dbb7c	d01685dd-bb48-4728-b14b-cd379b3939a5	c2dc8b2c-6375-49d6-b221-da2dc2aaea1d	Water	\N	0.30	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/d01685dd-bb48-4728-b14b-cd379b3939a5/1784302897961-9521f223-deb8-4576-af94-d269e49e3d0f.jpeg	t	2026-07-17 15:41:39.234493+00	\N	500	[]	[]	\N	[]	f	\N	0.100	Rim	8a502252-3b55-444c-a759-d0d210a221a1	0.500	l	\N	\N	t	150	10	5	3	\N	\N	\N	\N	\N	{}	\N
9dc77a6f-6497-4743-b498-11c14a11777d	897ac3c7-ee4e-41cf-bd51-c7996fc51614	5818f56a-435a-49a9-bcac-bd0ea2527dc6	Chicken Sub	Tender seasoned chicken served in a soft sub roll with fresh lettuce, ham, cheese, tomatoes, corn, pickles and mayo sauce for a simple yet satisfying bite	9.00	\N	t	2026-07-28 13:44:40.184542+00	\N	\N	[]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
d861a7ab-5cab-4978-a2d8-871b5def1dd8	897ac3c7-ee4e-41cf-bd51-c7996fc51614	5818f56a-435a-49a9-bcac-bd0ea2527dc6	Tawouk Wrap	\N	7.00	\N	t	2026-06-18 16:05:41.321919+00	Chicken, Garlic Paste, Fries, Pickles, Coleslaw	\N	[{"name": "Pickles"}, {"name": "Fries"}, {"name": "Coleslaw"}]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
47e4c207-2eb8-4717-97b0-fd14c974ceee	897ac3c7-ee4e-41cf-bd51-c7996fc51614	fb051d4c-09b1-4eac-b35e-6207ddd7d444	Four cheese Pizza	\N	10.00	\N	t	2026-07-28 13:33:07.483081+00	\N	\N	[]	[{"name": "Pepperoni", "price": 2}]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
229baf5e-789f-4c8a-96e6-545368a21685	897ac3c7-ee4e-41cf-bd51-c7996fc51614	a4546dfc-afdd-469b-aad6-db244a242b89	Quinoa Salad	Quinoa, green apples, avocado, fresh mushrooms, cucumber, pomegranate, cranberries, walnuts, balsamic vinegar dressing	15.00	\N	t	2026-07-28 13:41:11.932632+00	\N	\N	[]	[{"name": "Chicken", "price": 3}, {"name": "Halloumi", "price": 3}]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
51e7c431-9ac0-4325-98f9-2ed199d3b7a2	897ac3c7-ee4e-41cf-bd51-c7996fc51614	795a633b-7745-4887-ae94-ec1cbbe13230	Soft Drink	\N	1.10	\N	t	2026-07-28 13:45:49.05097+00	\N	\N	[]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
c9340493-f19a-478b-b9ea-1c0a5402a9d6	897ac3c7-ee4e-41cf-bd51-c7996fc51614	795a633b-7745-4887-ae94-ec1cbbe13230	Sparkling Water	\N	1.10	\N	t	2026-07-28 13:46:04.209396+00	\N	\N	[]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
d4297f37-e047-4256-ba89-b80c81d7f951	897ac3c7-ee4e-41cf-bd51-c7996fc51614	a1f77858-9ea9-446f-9d66-37bfc457c9d2	Grilled Chicken Burger	Grilled Chicken Topped with Iceberg, a Creamy Sauce, cheddar, potato sticks , served in a soft toasted bun for the perfect crunch in every bite.	7.00	\N	t	2026-06-20 21:11:34.873619+00	\N	\N	[{"name": "Potato Sticks"}, {"name": "Cheddar"}]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
ac815867-1c01-4a53-a2f0-f6cb089b1a41	897ac3c7-ee4e-41cf-bd51-c7996fc51614	795a633b-7745-4887-ae94-ec1cbbe13230	Beer	\N	3.00	\N	t	2026-07-28 13:46:27.818134+00	\N	\N	[]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
2d8b94be-207d-4274-bee3-735e98358789	897ac3c7-ee4e-41cf-bd51-c7996fc51614	a1f77858-9ea9-446f-9d66-37bfc457c9d2	Lokmati Lebanese Burger	Our Special Beef Patty with Ketchup, Fries, Coleslaw, Onion, and Tomato.	5.50	\N	t	2026-06-20 21:08:56.521527+00	\N	\N	[{"name": "Onion"}, {"name": "Tomato"}]	[{"name": "Add Patty", "price": 2.25}]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
8afd25a2-a912-40f5-be74-3c648815bccd	897ac3c7-ee4e-41cf-bd51-c7996fc51614	a1f77858-9ea9-446f-9d66-37bfc457c9d2	Mushroom Swiss Burger	Beef Patty, American & Emmental Cheese, Sauteed Mushrooms, Caramelized Onions and Mayo.	8.00	\N	t	2026-06-20 20:55:44.893059+00	\N	\N	[]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
772be335-8e71-40c2-908c-5edb3e409416	897ac3c7-ee4e-41cf-bd51-c7996fc51614	5818f56a-435a-49a9-bcac-bd0ea2527dc6	Three Cheese Fajita	Tender marinated chicken paired with creamy guacamole mayo and a rich blend of three cheeses, wrapped in soft sub roll for a smooth, flavorful bite.	8.00	\N	t	2026-07-28 13:36:35.429546+00	\N	\N	[{"name": "Peppers"}]	[]	\N	[]	f	\N	0.100	\N	\N	\N	g	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N
8f805a1c-4fbf-43d1-b17b-dc0f07735e0b	5eb1ce0e-c35c-44b6-80fe-12b921849ce1	232d22be-7e2d-4d0f-81b0-7462df564707	BASIC HEAVYWEIGHT T-SHIRT	\N	30.00	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786563717702-87ed0d1f-597d-4c64-960c-303c10c04673.jpg	t	2026-08-12 19:41:59.671255+00	100% cotton	\N	[]	[]	Size	[{"label": "Size", "values": [{"name": "XS", "price": 0}, {"name": "S", "price": 0}, {"name": "M", "price": 0}]}, {"label": "Color", "values": [{"name": "Grey", "price": 0, "image_url": "https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786563717702-87ed0d1f-597d-4c64-960c-303c10c04673.jpg"}, {"name": "Brown", "price": 0, "image_url": "https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786563717708-ffea5315-c8e4-441c-9cec-98b7ceaf01d8.jpg"}]}]	f	\N	0.100	\N	\N	\N	g	\N	\N	t	21	5	3	1	\N	\N	\N	\N	\N	{"M||Grey": 0, "S||Grey": 2, "M||Brown": 3, "S||Brown": 1, "XS||Grey": 10, "XS||Brown": 5}	women
50d676ce-693e-48d8-8f61-d88cbc62bd7a	5eb1ce0e-c35c-44b6-80fe-12b921849ce1	232d22be-7e2d-4d0f-81b0-7462df564707	BASIC HEAVYWEIGHT T-SHIRT	\N	30.17	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786455606047-ae9bd6cc-22e7-4d78-a775-5c1f4cb30d6d.jpg	t	2026-08-11 13:40:07.146926+00	Regular fit T-shirt made from compact cotton fabric. Featuring a round neck and short sleeves.	\N	[]	[]	Size	[{"label": "Size", "values": [{"name": "XS", "price": 0}, {"name": "S", "price": 0}, {"name": "XL", "price": 0}]}, {"label": "Color", "values": [{"name": "Black", "price": 0, "image_url": "https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786455603906-c444622a-1fca-4945-9e89-4572d1512d30.jpg"}, {"name": "White", "price": 0, "image_url": "https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786455603910-bf1a075f-a6da-4ceb-8852-60665d55f54f.jpg"}, {"name": "Faded Pink", "price": 0, "image_url": "https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786455603910-7842a259-9274-4764-9fb4-8a9898dfea4a.jpg"}]}]	f	\N	0.100	\N	\N	\N	g	\N	\N	t	25	5	3	1	\N	\N	\N	\N	\N	{"S||Black": 5, "S||White": 0, "XL||Black": 2, "XL||White": 4, "XS||Black": 2, "XS||White": 1, "S||Faded Pink": 1, "XL||Faded Pink": 3, "XS||Faded Pink": 7}	men
f9310a07-d892-4aaa-8fcb-33fe92de44cc	5eb1ce0e-c35c-44b6-80fe-12b921849ce1	8b1d4cd3-b4d5-448d-9165-8fd3987f8704	SOFT SPLIT SUEDE LOAFERS	\N	72.00	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786564535188-873df125-412d-4661-b468-ac4417ba6b46.jpg	t	2026-08-12 19:55:37.700051+00	Leather	\N	[]	[]	Size	[{"label": "Size", "values": [{"name": "36", "price": 0}, {"name": "40", "price": 0}, {"name": "42", "price": 0}]}, {"label": "Color", "values": [{"name": "Beige", "price": 0}]}]	f	\N	0.100	\N	\N	\N	g	\N	\N	t	10	5	3	1	\N	\N	\N	\N	\N	{"36||Beige": 2, "40||Beige": 5, "42||Beige": 3}	women
f849dbd1-aa7e-46b9-81a6-d346e75a1840	5eb1ce0e-c35c-44b6-80fe-12b921849ce1	aefea013-f521-4949-a714-4565bd962c8a	COCOA SUNSET	\N	30.00	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786566100995-f0dbd5eb-151c-4e31-ae4f-720a90793c47.jpg	t	2026-08-12 20:21:42.859711+00	EAU DE PARFUM	\N	[]	[]	Size	[{"label": "Size", "values": [{"name": "50mL", "price": 0}, {"name": "100mL", "price": 10}]}]	f	\N	0.100	\N	\N	\N	g	\N	\N	t	11	5	3	1	\N	\N	\N	\N	\N	{"50mL": 3, "100mL": 8}	men
9d403ca7-2f8e-475b-89ef-761c4e93e91f	5eb1ce0e-c35c-44b6-80fe-12b921849ce1	7aee95af-8c26-4f7b-b34b-a7a538d362f7	Soft Towels White	Machine wash before use\r\nAvailable in 4 sizes\r\nColors might slightly vary due to the difference in monitors	25.00	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/menu-items/5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786568280705-025060ab-7792-42c5-a2fb-a76d9650f194.png	t	2026-08-12 20:58:03.791333+00	100% Cotton	\N	[]	[]	Size	[{"label": "Size", "values": [{"name": "50 x 50 cm", "price": 0}]}, {"label": "Color", "values": [{"name": "White", "price": 0}]}]	f	\N	0.100	\N	\N	\N	g	\N	\N	t	15	10	5	3	\N	\N	\N	\N	\N	{"50 x 50 cm||White": 15}	\N
\.


--
-- Data for Name: menu_promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.menu_promotions (id, restaurant_id, scope_type, scope_id, percent_off, label, starts_at, ends_at, is_active, priority, created_at, updated_at) FROM stdin;
4bf8ea15-a4bf-4885-8d67-b39f69058694	d01685dd-bb48-4728-b14b-cd379b3939a5	store	\N	15.00	Summer Sale	2026-08-01 00:00:00+00	2026-08-10 00:00:00+00	t	0	2026-07-17 18:34:47.408505+00	2026-07-17 18:34:47.408505+00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, restaurant_id, customer_id, customer_name, customer_phone, delivery_address, delivery_lat, delivery_lng, items, notes, total_usd, status, whatsapp_sent, created_at, updated_at, delivery_fee_usd, scheduled_for, delivery_speed, payment_note, coupon_code, coupon_discount_usd, coupon_code_id, expected_delivery_time, expected_delivery_time_set_at, driver_id, driver_assigned_at) FROM stdin;
bd6d2b2b-5ebe-41c6-9ea1-14285b7b00a4	d01685dd-bb48-4728-b14b-cd379b3939a5	eb8a6434-b253-42fb-adbb-f508307c236b	Wissam Walid Baaklini	+96171212734	RH65+RM6, Houmal, Lebanon	33.81256213828001	35.55787959756088	[{"qty": 2, "name": "Eggs", "unit": "each", "unitPrice": 5.5, "menuItemId": "f45af2d1-4eb1-4cd6-b08f-704ba0d7ce39", "optionLabel": null, "selectedOption": null, "addedIngredients": [], "removedIngredients": [], "specialInstructions": ""}]	\N	11.00	confirmed	f	2026-07-18 12:54:20.515831+00	2026-07-18 12:57:47.596655+00	0.00	\N	standard	\N	\N	0.00	\N	30 min	2026-07-18 12:57:46.344+00	63216faf-450d-42b2-a9e6-1d3db2671396	2026-07-18 12:57:00.071+00
5b6a8e71-6c63-424b-9bdb-763b87040fe1	d01685dd-bb48-4728-b14b-cd379b3939a5	eb8a6434-b253-42fb-adbb-f508307c236b	Wissam Walid Baaklini	+96171212734	RGPJ+GGR, Hadath, Lebanon	33.83676386964172	35.531287597706886	[{"qty": 1, "name": "Eggs", "unit": "each", "unitPrice": 5.5, "menuItemId": "f45af2d1-4eb1-4cd6-b08f-704ba0d7ce39", "optionLabel": null, "selectedOption": null, "addedIngredients": [], "removedIngredients": [], "specialInstructions": ""}]	\N	5.50	delivered	f	2026-07-18 07:31:18.812731+00	2026-07-18 12:58:16.811992+00	0.00	\N	standard	\N	\N	0.00	\N	45 min	2026-07-18 12:58:04.091+00	63216faf-450d-42b2-a9e6-1d3db2671396	2026-07-18 12:57:59.225+00
\.


--
-- Data for Name: password_change_otps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_change_otps (id, user_id, otp_hash, expires_at, used_at, created_at) FROM stdin;
a6cb82f1-9af6-4e3c-be22-f837fbce38d9	52416e99-d310-4bd6-aeda-9abd5850c915	0b8a890906a152690b7ee735715b613ea6905edea7425f8cf8bf1f38c12005fe	2026-04-16 17:24:34.023+00	2026-05-09 07:46:37.928+00	2026-04-16 17:14:34.969114+00
99cba23b-4ca1-42d9-a7e1-021dd2c14e0e	52416e99-d310-4bd6-aeda-9abd5850c915	38433c415398d7a0a243a3c3eb6e4ea943b7367a0b6692c08d0175bd7d8f43ce	2026-05-09 07:56:37.928+00	2026-05-09 07:47:39.819+00	2026-05-09 07:46:38.344238+00
b39d1649-2da0-4860-8b61-bcdc0e811b91	6036533f-6759-4df5-b9e7-2a771d6bc87c	57867b3fd2fe8e703aa8e7715e136d7c6acebb0b0932057cc98851ee983f0bf8	2026-06-18 14:18:38.234+00	2026-06-18 14:09:06.778+00	2026-06-18 14:08:39.042265+00
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, invoice_id, restaurant_id, amount_paid, paid_at, method, reference_note, recorded_by, created_at) FROM stdin;
\.


--
-- Data for Name: payroll_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payroll_entries (id, payroll_run_id, restaurant_id, employee_id, base_amount, overtime_amount, bonus_amount, deduction_amount, net_amount, paid_at, created_at) FROM stdin;
\.


--
-- Data for Name: payroll_runs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payroll_runs (id, restaurant_id, period_start, period_end, status, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: platform_ops_payment_reminder_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_ops_payment_reminder_log (id, payment_id, reminder_kind, due_at, sent_at) FROM stdin;
\.


--
-- Data for Name: platform_ops_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_ops_payments (id, title, category, amount, currency, due_at, paid_at, notes, reminder_enabled, created_at, updated_at) FROM stdin;
66031cec-adb0-4dee-a893-da27e79e6bf0	zboun.net	domain	\N	USD	2027-06-23 14:08:00+00	\N	Domain subscription (Omar) on cloudflare	t	2026-06-24 11:09:00.757683+00	2026-06-24 11:09:00.119+00
241acd1b-8241-4805-b685-0c47b7f4d4d6	sharij khate	other	\N	USD	2027-07-22 21:00:00+00	\N	sharij khate abel 23 july 2027	t	2026-07-24 05:54:44.615985+00	2026-07-24 05:54:43.766+00
\.


--
-- Data for Name: pms_charges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pms_charges (id, restaurant_id, reservation_id, category, description, amount, charged_at, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: pms_housekeeping_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pms_housekeeping_logs (id, restaurant_id, room_id, task_type, status, assigned_to, notes, scheduled_date, completed_at, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pms_reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pms_reservations (id, restaurant_id, room_id, room_type_id, reference_number, guest_name, guest_phone, guest_email, guest_id_number, nationality, adults, children, check_in_date, check_out_date, actual_check_in, actual_check_out, status, rate_per_night, room_total, charges_total, grand_total, amount_paid, booking_source, special_requests, internal_notes, crm_customer_id, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pms_room_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pms_room_types (id, restaurant_id, name, description, capacity, base_rate, currency, amenities, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pms_rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pms_rooms (id, restaurant_id, room_type_id, room_number, floor, status, notes, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pos_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pos_order_items (id, order_id, restaurant_id, menu_item_id, item_name, qty, unit_price, line_total, created_at) FROM stdin;
\.


--
-- Data for Name: pos_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pos_orders (id, restaurant_id, session_id, receipt_number, order_type, status, subtotal, tax_amount, total_amount, paid_amount, note, created_by, created_at, updated_at, customer_id) FROM stdin;
\.


--
-- Data for Name: pos_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pos_payments (id, order_id, restaurant_id, method, amount, paid_at, reference, recorded_by, created_at) FROM stdin;
\.


--
-- Data for Name: pos_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pos_sessions (id, restaurant_id, opened_by, opened_at, closed_at, status, opening_float, closing_note, created_at) FROM stdin;
\.


--
-- Data for Name: restaurant_addons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurant_addons (id, restaurant_id, addon_key, is_enabled, enabled_at, enabled_by, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: restaurant_delivery_tiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurant_delivery_tiers (id, restaurant_id, min_distance_km, max_distance_km, fee_usd, "position", created_at, updated_at) FROM stdin;
5ed172ee-c50e-4ac9-9a72-e0e1ccb8d792	d01685dd-bb48-4728-b14b-cd379b3939a5	0.00	5.00	2.00	0	2026-08-04 10:19:39.466466+00	2026-08-04 10:19:39.466466+00
601cec5d-3d1d-4dc3-9452-6b24ab39b748	d01685dd-bb48-4728-b14b-cd379b3939a5	5.00	10.00	3.00	1	2026-08-04 10:19:39.466466+00	2026-08-04 10:19:39.466466+00
db824d88-be08-42c0-bd78-cde3ba016f04	d01685dd-bb48-4728-b14b-cd379b3939a5	10.00	15.00	4.00	2	2026-08-04 10:19:39.466466+00	2026-08-04 10:19:39.466466+00
\.


--
-- Data for Name: restaurant_drivers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurant_drivers (id, restaurant_id, full_name, phone, notes, is_active, created_at, updated_at) FROM stdin;
63216faf-450d-42b2-a9e6-1d3db2671396	d01685dd-bb48-4728-b14b-cd379b3939a5	Driver 1	+9613123567	\N	t	2026-07-17 18:40:49.005114+00	2026-07-17 18:40:49.005114+00
\.


--
-- Data for Name: restaurant_employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurant_employees (id, restaurant_id, full_name, role_title, base_salary, salary_type, hire_date, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: restaurant_fast_delivery_tiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurant_fast_delivery_tiers (id, restaurant_id, min_distance_km, max_distance_km, fee_usd, "position", created_at, updated_at) FROM stdin;
3fefe8ef-f01e-48a1-bb71-527087819ffe	d01685dd-bb48-4728-b14b-cd379b3939a5	0.00	5.00	4.00	0	2026-08-04 10:19:40.037919+00	2026-08-04 10:19:40.037919+00
9128bde1-0bd1-499d-9bc9-785e426ab94e	d01685dd-bb48-4728-b14b-cd379b3939a5	5.00	10.00	6.00	1	2026-08-04 10:19:40.037919+00	2026-08-04 10:19:40.037919+00
7410dcf7-98e8-428d-b886-d55d2eaed391	d01685dd-bb48-4728-b14b-cd379b3939a5	10.00	15.00	8.00	2	2026-08-04 10:19:40.037919+00	2026-08-04 10:19:40.037919+00
\.


--
-- Data for Name: restaurant_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurant_locations (id, restaurant_id, name, latitude, longitude, address, phone, is_main, "position", created_at) FROM stdin;
e95746ec-97f1-4d55-93f0-29c4d0991c69	897ac3c7-ee4e-41cf-bd51-c7996fc51614	Store location	33.8392369045457	35.5307544402794	RGQJ+P8C, Hadath, Lebanon	\N	t	0	2026-06-18 16:01:22.85221+00
401f7ece-f193-4348-bb6c-aaadfdd2f46d	d01685dd-bb48-4728-b14b-cd379b3939a5	Store location	33.8355003619613	35.5328944221359	RGPM+435, Hadath, Lebanon	\N	t	0	2026-07-17 15:04:40.611095+00
\.


--
-- Data for Name: restaurant_ratings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurant_ratings (id, restaurant_id, rater_id, rating, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: restaurant_stock_sync; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurant_stock_sync (id, restaurant_id, platform, is_enabled, inbound_api_key, outbound_webhook_url, outbound_secret, last_inbound_at, last_outbound_at, created_at, updated_at) FROM stdin;
69419886-a975-4af4-8282-f46a114ac3cc	d01685dd-bb48-4728-b14b-cd379b3939a5	custom	f	zbn_live_7b57eebc50936a465ceacd2fed965d6e9f83554567565cac	\N	9e1a035e1e93fbdc1d1b94c26e1e01f1b80e21d7db0d399a9708c09a432c82dc	\N	\N	2026-07-28 19:52:06.28686+00	2026-07-28 19:52:06.28686+00
\.


--
-- Data for Name: restaurant_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurant_subscriptions (id, restaurant_id, plan_id, status, start_at, next_due_at, ended_at, billing_cycle_price, notes, created_at, updated_at) FROM stdin;
aa0d0b4c-e0af-4dfd-83ee-b52b9e0fcf85	897ac3c7-ee4e-41cf-bd51-c7996fc51614	6b57bc80-19f1-4875-a5dc-91fa1165c17c	active	2026-06-18 14:05:36.989+00	2099-12-31 23:59:59.999+00	\N	0.00	Lifetime complimentary account — no billing.	2026-06-18 14:05:37.108415+00	2026-06-18 14:05:37.108415+00
ca6aa64a-9049-47a4-8f48-8bf5e9b62493	d01685dd-bb48-4728-b14b-cd379b3939a5	6b57bc80-19f1-4875-a5dc-91fa1165c17c	active	2026-07-17 14:58:10.078+00	2026-08-17 14:58:10.078+00	\N	10.00	Initial subscription created with restaurant account.	2026-07-17 14:58:10.639279+00	2026-07-17 14:58:10.639279+00
e28e6141-fb05-47a1-bcf0-9dd4d28b6c60	dcb65d00-05dd-4217-989c-df0fe78df4d9	6b57bc80-19f1-4875-a5dc-91fa1165c17c	active	2026-08-05 11:57:33.349+00	2027-02-05 11:57:33.349+00	\N	0.00	Complimentary 6 months — free until February 5, 2027.	2026-08-05 11:57:33.52543+00	2026-08-05 11:57:33.52543+00
253e052d-d946-4c93-a736-0316176d9794	5eb1ce0e-c35c-44b6-80fe-12b921849ce1	6b57bc80-19f1-4875-a5dc-91fa1165c17c	active	2026-08-10 18:23:18.331+00	2099-12-31 23:59:59.999+00	\N	0.00	Lifetime complimentary account — no billing.	2026-08-10 18:23:18.457091+00	2026-08-10 18:23:18.457091+00
\.


--
-- Data for Name: restaurants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restaurants (id, name, slug, phone, logo_url, is_active, created_at, show_on_home, lbp_rate, browse_sections, banner_url, description, rating, location, eta_label, business_type, latitude, longitude, delivery_radius_km, free_delivery, delivery_fee_usd, opening_hours, is_temporarily_closed, fast_delivery_enabled, fast_delivery_fee_usd, billing_exempt, menu_theme_color, allow_guest_checkout, driver_management_enabled, delivers_nationwide, instagram_url, tiktok_url, facebook_url, twitter_url, youtube_url) FROM stdin;
5eb1ce0e-c35c-44b6-80fe-12b921849ce1	Nova	nova	76742630	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/restaurant-logos/5eb1ce0e-c35c-44b6-80fe-12b921849ce1/logo-1786438300173-62f87fe3-5459-4599-a50d-7253943aab1c.png	t	2026-08-10 18:23:17.340713+00	t	89500.00	{"Fashion & Apparel",Clothing,"Shoes & Footwear","Bags & Accessories","Kids & Baby","Kids Fashion",Boutiques,Perfumes,Sunglasses}	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/restaurant-logos/5eb1ce0e-c35c-44b6-80fe-12b921849ce1/banner-1786438306494-3e7cde74-5c64-4832-9b3d-9fa561860e24.png	\N	\N	\N	\N	retail_store	\N	\N	15.00	f	2.00	[{"day": 0, "open": "10:00", "close": "22:00", "closed": false}, {"day": 1, "open": "09:00", "close": "22:00", "closed": false}, {"day": 2, "open": "09:00", "close": "22:00", "closed": false}, {"day": 3, "open": "09:00", "close": "22:00", "closed": false}, {"day": 4, "open": "09:00", "close": "22:00", "closed": false}, {"day": 5, "open": "09:00", "close": "22:00", "closed": false}, {"day": 6, "open": "09:00", "close": "22:00", "closed": false}]	f	f	0.00	t	#111111	t	f	f	https://www.instagram.com/zbounnet	\N	\N	\N	\N
d01685dd-bb48-4728-b14b-cd379b3939a5	Morning Bite	morning-bite	71212734	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/restaurant-logos/d01685dd-bb48-4728-b14b-cd379b3939a5/logo-1784300676186-f7c2fa5d-e0fa-4b2b-875c-a4f3e44a7387.jpeg	t	2026-07-17 14:58:07.908175+00	f	89500.00	{"Food & Restaurants",Breakfast}	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/restaurant-logos/d01685dd-bb48-4728-b14b-cd379b3939a5/banner-1784300677986-6c18f0fe-04b1-4bdb-8cee-5134ef409bad.jpeg	Morning Bite servers fresh breakfast, handcrafted coffee, and delicious morning favorites made fast every day.	\N	Hadath	15-30 mins	restaurant	33.8355003619613	35.5328944221359	15.00	f	2.00	[]	f	t	5.00	f	#f9ae0c	f	t	f	\N	\N	\N	\N	\N
897ac3c7-ee4e-41cf-bd51-c7996fc51614	LOKMATI	lokmati	96170551127	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/restaurant-logos/897ac3c7-ee4e-41cf-bd51-c7996fc51614/logo-1781798077612-a6d56347-5935-4408-90ad-181964023d62.jpeg	t	2026-06-18 14:05:35.492648+00	t	90000.00	{"Food & Restaurants",Lunch}	https://tbnfrqftpocihuzvlttm.supabase.co/storage/v1/object/public/restaurant-logos/897ac3c7-ee4e-41cf-bd51-c7996fc51614/banner-1781797959616-0f9f4747-5816-4be6-858f-bd0c700a9d0f.jpeg	\N	\N	Hadath	\N	restaurant	33.8392369045457	35.5307544402794	10.00	f	2.00	[{"day": 0, "open": "10:00", "close": "22:00", "closed": true}, {"day": 1, "open": "12:00", "close": "22:00", "closed": false}, {"day": 2, "open": "12:00", "close": "22:00", "closed": false}, {"day": 3, "open": "12:00", "close": "22:00", "closed": false}, {"day": 4, "open": "12:00", "close": "22:00", "closed": false}, {"day": 5, "open": "12:00", "close": "22:00", "closed": false}, {"day": 6, "open": "12:00", "close": "22:00", "closed": false}]	f	f	0.00	t	#aabc4c	f	f	f	\N	\N	\N	\N	\N
dcb65d00-05dd-4217-989c-df0fe78df4d9	Beirut Vape Official	beirut-vape-official	03663943	\N	t	2026-08-05 11:57:31.44855+00	t	89500.00	{"Smoke & Tobacco",Devices,"E-liquid & Pods","Smoke Accessories",Tobacco}	\N	\N	\N	\N	\N	retail_store	\N	\N	15.00	f	0.00	[{"day": 0, "open": "10:00", "close": "22:00", "closed": false}, {"day": 1, "open": "09:00", "close": "22:00", "closed": false}, {"day": 2, "open": "09:00", "close": "22:00", "closed": false}, {"day": 3, "open": "09:00", "close": "22:00", "closed": false}, {"day": 4, "open": "09:00", "close": "22:00", "closed": false}, {"day": 5, "open": "09:00", "close": "22:00", "closed": false}, {"day": 6, "open": "09:00", "close": "22:00", "closed": false}]	f	f	0.00	f	\N	f	f	f	\N	\N	\N	\N	\N
\.


--
-- Data for Name: retail_daily_closes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.retail_daily_closes (id, restaurant_id, closed_by, closed_by_name, notes, metrics_snapshot, closed_at) FROM stdin;
\.


--
-- Data for Name: stock_sync_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_sync_events (id, restaurant_id, menu_item_id, direction, sku, quantity, status, error_message, created_at) FROM stdin;
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (id, name, "interval", price, is_active, created_at) FROM stdin;
6b57bc80-19f1-4875-a5dc-91fa1165c17c	Monthly	monthly	10.00	t	2026-05-18 13:45:12.691615+00
01836f4d-f348-43f7-9d50-49c294f92c4c	Yearly	yearly	100.00	t	2026-06-25 13:26:01.851692+00
\.


--
-- Data for Name: subscription_reminder_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_reminder_log (id, subscription_id, reminder_kind, due_at, sent_at) FROM stdin;
df68c4be-806f-4ef7-a6b2-0261a98ea9f0	ca6aa64a-9049-47a4-8f48-8bf5e9b62493	ten_day_expiry	2026-08-17	2026-08-07 07:03:06.817869+00
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, restaurant_id, name, contact_name, phone, email, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: table_reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.table_reservations (id, restaurant_id, guest_name, guest_phone, guest_email, reservation_date, reservation_time, party_size, table_label, status, special_requests, internal_notes, crm_customer_id, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, role, restaurant_id, created_at, must_change_password) FROM stdin;
de486008-f9d9-40cf-a0c1-9ac99a0d714d	Nova Admin	abirachedlea480@gmail.com	restaurant_admin	5eb1ce0e-c35c-44b6-80fe-12b921849ce1	2026-08-10 18:23:17.946616+00	f
52416e99-d310-4bd6-aeda-9abd5850c915	tali-studios	tali-studios@outlook.com	superadmin	\N	2026-04-10 06:05:46.691477+00	f
6036533f-6759-4df5-b9e7-2a771d6bc87c	LOKMATI Admin	jabrgaelle@gmail.com	restaurant_admin	897ac3c7-ee4e-41cf-bd51-c7996fc51614	2026-06-18 14:05:36.604487+00	f
b8fd536a-8933-4b7e-88b1-644e389e0b40	Morning Bite Admin	wissam8802@gmail.com	restaurant_admin	d01685dd-bb48-4728-b14b-cd379b3939a5	2026-07-17 14:58:09.328679+00	f
0941a5bf-911d-4632-8c78-f267860c6ec4	Beirut Vape Official Admin	touficmmachaca@gmail.com	restaurant_admin	dcb65d00-05dd-4217-989c-df0fe78df4d9	2026-08-05 11:57:32.956629+00	f
\.


--
-- Data for Name: messages_2026_08_04; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_08_04 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: messages_2026_08_05; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_08_05 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: messages_2026_08_06; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_08_06 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: messages_2026_08_07; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_08_07 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: messages_2026_08_08; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_08_08 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: messages_2026_08_09; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_08_09 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: messages_2026_08_10; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_08_10 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-04-09 21:47:23
20211116045059	2026-04-09 21:47:24
20211116050929	2026-04-09 21:47:25
20211116051442	2026-04-09 21:47:26
20211116212300	2026-04-09 21:47:26
20211116213355	2026-04-09 21:47:27
20211116213934	2026-04-09 21:47:28
20211116214523	2026-04-09 21:47:29
20211122062447	2026-04-09 21:47:29
20211124070109	2026-04-09 21:47:30
20211202204204	2026-04-09 21:47:31
20211202204605	2026-04-09 21:47:31
20211210212804	2026-04-09 21:47:33
20211228014915	2026-04-09 21:47:34
20220107221237	2026-04-09 21:47:35
20220228202821	2026-04-09 21:47:35
20220312004840	2026-04-09 21:47:36
20220603231003	2026-04-09 21:47:37
20220603232444	2026-04-09 21:47:38
20220615214548	2026-04-09 21:47:39
20220712093339	2026-04-09 21:47:39
20220908172859	2026-04-09 21:47:40
20220916233421	2026-04-09 21:47:41
20230119133233	2026-04-09 21:47:41
20230128025114	2026-04-09 21:47:42
20230128025212	2026-04-09 21:47:43
20230227211149	2026-04-09 21:47:44
20230228184745	2026-04-09 21:47:44
20230308225145	2026-04-09 21:47:45
20230328144023	2026-04-09 21:47:46
20231018144023	2026-04-09 21:47:46
20231204144023	2026-04-09 21:47:47
20231204144024	2026-04-09 21:47:48
20231204144025	2026-04-09 21:47:49
20240108234812	2026-04-09 21:47:49
20240109165339	2026-04-09 21:47:50
20240227174441	2026-04-09 21:47:51
20240311171622	2026-04-09 21:47:52
20240321100241	2026-04-09 21:47:54
20240401105812	2026-04-09 21:47:56
20240418121054	2026-04-09 21:47:57
20240523004032	2026-04-09 21:47:59
20240618124746	2026-04-09 21:48:00
20240801235015	2026-04-09 21:48:00
20240805133720	2026-04-09 21:48:01
20240827160934	2026-04-09 21:48:02
20240919163303	2026-04-09 21:48:03
20240919163305	2026-04-09 21:48:03
20241019105805	2026-04-09 21:48:04
20241030150047	2026-04-09 21:48:06
20241108114728	2026-04-09 21:48:07
20241121104152	2026-04-09 21:48:08
20241130184212	2026-04-09 21:48:09
20241220035512	2026-04-09 21:48:10
20241220123912	2026-04-09 21:48:10
20241224161212	2026-04-09 21:48:11
20250107150512	2026-04-09 21:48:12
20250110162412	2026-04-09 21:48:12
20250123174212	2026-04-09 21:48:13
20250128220012	2026-04-09 21:48:14
20250506224012	2026-04-09 21:48:14
20250523164012	2026-04-09 21:48:15
20250714121412	2026-04-09 21:48:15
20250905041441	2026-04-09 21:48:16
20251103001201	2026-04-09 21:48:17
20251120212548	2026-04-09 21:48:18
20251120215549	2026-04-09 21:48:18
20260218120000	2026-04-09 21:48:19
20260326120000	2026-04-10 12:28:07
20260514120000	2026-06-04 12:01:41
20260527120000	2026-06-04 12:01:43
20260528120000	2026-06-04 12:01:44
20260603120000	2026-06-04 12:01:45
20260605120000	2026-06-18 13:51:03
20260606110000	2026-06-18 13:51:04
20260616120000	2026-06-25 11:09:42
20260624120000	2026-06-25 11:09:44
20260626120000	2026-07-02 14:12:05
20260706120000	2026-07-09 06:21:40
20260707120000	2026-07-16 20:42:03
20260709120000	2026-07-16 20:42:04
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter, selected_columns) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
menu-items	menu-items	\N	2026-04-16 17:30:59.101331+00	2026-04-16 17:30:59.101331+00	t	f	\N	\N	\N	STANDARD
restaurant-logos	restaurant-logos	\N	2026-04-16 17:30:59.101331+00	2026-04-16 17:30:59.101331+00	t	f	\N	\N	\N	STANDARD
customer-address-media	customer-address-media	\N	2026-06-01 15:48:55.595172+00	2026-06-01 15:48:55.595172+00	t	f	\N	\N	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-04-09 21:47:20.104619
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-04-09 21:47:20.140441
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-04-09 21:47:20.146258
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-04-09 21:47:20.171357
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-04-09 21:47:20.185267
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-04-09 21:47:20.189647
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-04-09 21:47:20.19505
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-04-09 21:47:20.200158
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-04-09 21:47:20.204934
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-04-09 21:47:20.210648
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-04-09 21:47:20.215366
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-04-09 21:47:20.220397
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-04-09 21:47:20.225388
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-04-09 21:47:20.230075
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-04-09 21:47:20.23505
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-04-09 21:47:20.258923
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-04-09 21:47:20.264001
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-04-09 21:47:20.26865
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-04-09 21:47:20.273216
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-04-09 21:47:20.279157
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-04-09 21:47:20.284025
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-04-09 21:47:20.290125
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-04-09 21:47:20.303843
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-04-09 21:47:20.31337
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-04-09 21:47:20.317965
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-04-09 21:47:20.322795
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-04-09 21:47:20.327489
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-04-09 21:47:20.33193
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-04-09 21:47:20.336183
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-04-09 21:47:20.340472
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-04-09 21:47:20.344564
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-04-09 21:47:20.34878
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-04-09 21:47:20.353026
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-04-09 21:47:20.357151
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-04-09 21:47:20.361321
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-04-09 21:47:20.365567
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-04-09 21:47:20.369785
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-04-09 21:47:20.374043
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-04-09 21:47:20.379217
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-04-09 21:47:20.388323
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-04-09 21:47:20.3928
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-04-09 21:47:20.397049
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-04-09 21:47:20.401488
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-04-09 21:47:20.405806
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-04-09 21:47:20.410449
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-04-09 21:47:20.415309
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-04-09 21:47:20.424646
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-04-09 21:47:20.429661
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-04-09 21:47:20.43411
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-04-09 21:47:20.449757
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-04-09 21:47:20.454821
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-04-09 21:47:20.913166
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-04-09 21:47:20.915246
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-04-09 21:47:20.926084
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-04-09 21:47:20.928979
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-04-09 21:47:20.930902
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-04-09 21:47:20.941975
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-04-09 21:47:20.946633
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-04-09 21:47:20.936287
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-04-28 13:27:38.428511
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-04-29 16:44:47.675492
61	mark-filename-immutable	fe0096517ae9d60aaec1d110172ba9036dc66bb7	2026-08-10 12:36:46.351106
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
cfe0e921-6232-4dd2-baa3-7eeb1a99ff7c	restaurant-logos	8814231f-e201-44bc-b974-554ecfbacc9e/logo-1776360771598-e5c5908e-418a-447e-bfe9-3f2874ad965f.png	\N	2026-04-16 17:32:53.523507+00	2026-04-16 17:32:53.523507+00	2026-04-16 17:32:53.523507+00	{"eTag": "\\"f168a6608ece970085eed8547173e845\\"", "size": 273321, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-04-16T17:32:54.000Z", "contentLength": 273321, "httpStatusCode": 200}	73c17d69-f624-4bed-82e2-0b1b0f49dd5e	\N	{}
3af53b47-461e-4093-a38a-b6655417872f	menu-items	d01685dd-bb48-4728-b14b-cd379b3939a5/1784303818138-2267e208-275f-47db-903a-b613938f3189.png	\N	2026-07-17 15:57:00.342491+00	2026-07-17 15:57:00.342491+00	2026-07-17 15:57:00.342491+00	{"eTag": "\\"02dca9401154b77b418dc0a45780b224\\"", "size": 1964311, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-17T15:57:01.000Z", "contentLength": 1964311, "httpStatusCode": 200}	960c886a-96aa-448e-94c8-86cf9b882b7f	\N	{}
c413c6d8-e2a4-47f0-b222-4346af4b9f5c	menu-items	8814231f-e201-44bc-b974-554ecfbacc9e/1776360891928-6806228b-556a-41ad-b4ce-786217401e6c.png	\N	2026-04-16 17:34:52.494461+00	2026-04-16 17:34:52.494461+00	2026-04-16 17:34:52.494461+00	{"eTag": "\\"945eea0f9ac6786a134d8531cb08898f\\"", "size": 6550, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-04-16T17:34:53.000Z", "contentLength": 6550, "httpStatusCode": 200}	e7c3ebea-7513-46a9-a47f-bf65f0556197	\N	{}
6ef81ce6-2349-4e28-828b-1dc7e05ca054	menu-items	8814231f-e201-44bc-b974-554ecfbacc9e/1776361111013-cdbd1d6a-e2e4-4f19-abed-c7e9708a240c.png	\N	2026-04-16 17:38:32.778658+00	2026-04-16 17:38:32.778658+00	2026-04-16 17:38:32.778658+00	{"eTag": "\\"8a03016575b71270d4a1ce453183aa0c\\"", "size": 8438, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-04-16T17:38:33.000Z", "contentLength": 8438, "httpStatusCode": 200}	aca49e89-7751-4cff-8a9a-e8fa9f565c23	\N	{}
14401d2c-f4d2-4611-9a84-f315df075fab	menu-items	d01685dd-bb48-4728-b14b-cd379b3939a5/1784303903128-bf7be926-cb26-4a4d-b939-26d826967638.png	\N	2026-07-17 15:58:24.968172+00	2026-07-17 15:58:24.968172+00	2026-07-17 15:58:24.968172+00	{"eTag": "\\"76cdf203d80f018df458d0fb6a666d37\\"", "size": 1587803, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-17T15:58:25.000Z", "contentLength": 1587803, "httpStatusCode": 200}	09b748cb-8db2-4092-b110-824a79b1bd61	\N	{}
b9f75095-1edd-4e7a-be07-2ab845da5f0b	menu-items	8814231f-e201-44bc-b974-554ecfbacc9e/1776695120543-e87b7c69-70ba-4611-9102-8aff71d30f60.png	\N	2026-04-20 14:25:21.675685+00	2026-04-20 14:25:21.675685+00	2026-04-20 14:25:21.675685+00	{"eTag": "\\"5cef3d71bc9b0ba43c75bbe457f38495\\"", "size": 23678, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-04-20T14:25:22.000Z", "contentLength": 23678, "httpStatusCode": 200}	f5678719-8dc8-45b1-9898-790d4fc33461	\N	{}
e48a066d-749b-415f-8808-6f62f8a23281	menu-items	5a14f102-6c86-4b04-a10e-cc1e1cd4e283/1776971789232-c0768518-9532-421e-9bf7-0692010d670f.jpg	\N	2026-04-23 19:16:30.75217+00	2026-04-23 19:16:30.75217+00	2026-04-23 19:16:30.75217+00	{"eTag": "\\"2e04794ede0fe3e640cd03c6afaf9224\\"", "size": 12329, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-04-23T19:16:31.000Z", "contentLength": 12329, "httpStatusCode": 200}	2a7e1f12-89f1-4e0a-91bd-cea85a5cc41b	\N	{}
52a48453-4c2e-4c7d-9b25-e87e56a59b00	menu-items	d01685dd-bb48-4728-b14b-cd379b3939a5/1784303941061-28586573-b844-4aa5-a8db-587ef0b4084e.png	\N	2026-07-17 15:59:02.98506+00	2026-07-17 15:59:02.98506+00	2026-07-17 15:59:02.98506+00	{"eTag": "\\"05ce91899c19702bee33ef98c4ad1c8d\\"", "size": 2091348, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-17T15:59:03.000Z", "contentLength": 2091348, "httpStatusCode": 200}	4491b5dd-ae16-44cc-a816-08ccb1edd411	\N	{}
7c9d990b-87f6-4039-8196-997b2fd48ae6	menu-items	5a14f102-6c86-4b04-a10e-cc1e1cd4e283/1776972007463-1a06d259-7b00-4700-8fa8-df4434f88890.webp	\N	2026-04-23 19:20:09.304582+00	2026-04-23 19:20:09.304582+00	2026-04-23 19:20:09.304582+00	{"eTag": "\\"867d81d58208a5bf92f92ad5db5cf47e\\"", "size": 59244, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-04-23T19:20:10.000Z", "contentLength": 59244, "httpStatusCode": 200}	7b6dc586-8b6d-42ea-a81f-0573f11c255b	\N	{}
9eca3330-0c1a-4384-9e88-8412163d43cc	restaurant-logos	8814231f-e201-44bc-b974-554ecfbacc9e/banner-1777403920265-7bb9bc89-7e1d-4e7a-90b1-1a642b12fe6f.png	\N	2026-04-28 19:18:44.734546+00	2026-04-28 19:18:44.734546+00	2026-04-28 19:18:44.734546+00	{"eTag": "\\"be0cb838922db6d3e1174275b0ed8455\\"", "size": 2064503, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-04-28T19:18:45.000Z", "contentLength": 2064503, "httpStatusCode": 200}	7d5c47bb-a487-47c6-b737-ed982df1227b	\N	{}
ded5fb36-4dfa-46de-ac62-34c9bec7f9e6	restaurant-logos	8814231f-e201-44bc-b974-554ecfbacc9e/logo-1777403936945-2134ff8f-c40c-4791-be3b-ef3321b40780.png	\N	2026-04-28 19:19:00.503902+00	2026-04-28 19:19:00.503902+00	2026-04-28 19:19:00.503902+00	{"eTag": "\\"fd1ae996e460277eb484a63cfd58f0af\\"", "size": 1191447, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-04-28T19:19:01.000Z", "contentLength": 1191447, "httpStatusCode": 200}	f6d1032c-8398-4e48-9a9a-5bfe4ab9b47e	\N	{}
8126e688-1511-4b0f-a662-893b99a7e3bc	menu-items	d01685dd-bb48-4728-b14b-cd379b3939a5/1784303984800-a06f4e2f-0974-4158-9338-932e57a8dda8.png	\N	2026-07-17 15:59:46.539694+00	2026-07-17 15:59:46.539694+00	2026-07-17 15:59:46.539694+00	{"eTag": "\\"08d5cd12d2afb92e1edaab9615c317c5\\"", "size": 1512366, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-17T15:59:47.000Z", "contentLength": 1512366, "httpStatusCode": 200}	f55c79be-8388-4847-b3b2-4fe89bfa17ea	\N	{}
8a2dbe29-9f5c-41da-8e3b-50d5f8741bdf	restaurant-logos	0e1bfac2-9652-4d81-b97e-4c313b588427/logo-1778436116347-f8666499-1ee8-4b62-9e4b-d993ac04b902.jpg	\N	2026-05-10 18:01:58.470912+00	2026-05-10 18:01:58.470912+00	2026-05-10 18:01:58.470912+00	{"eTag": "\\"07aada1b22e9fe2084ce861c36c6e959\\"", "size": 2178857, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-10T18:01:59.000Z", "contentLength": 2178857, "httpStatusCode": 200}	2cf7a3a4-2d33-4e86-be2b-414fcfdea829	\N	{}
08fcfde5-4ae5-4a9a-9c86-e22d7e314ba5	restaurant-logos	0e1bfac2-9652-4d81-b97e-4c313b588427/banner-1778436118640-99d159ae-a66a-4f43-bb70-1ac1b63e83d6.jpg	\N	2026-05-10 18:02:00.405964+00	2026-05-10 18:02:00.405964+00	2026-05-10 18:02:00.405964+00	{"eTag": "\\"4014be64f66378548e9bd4a32f35ddb4\\"", "size": 1485696, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-10T18:02:01.000Z", "contentLength": 1485696, "httpStatusCode": 200}	f2f94152-de45-4ba9-8e41-97e499691b5b	\N	{}
1c44b024-5951-425e-8a46-cffdcf75e6e1	menu-items	d01685dd-bb48-4728-b14b-cd379b3939a5/1784304044575-719cba43-8fef-4787-934e-74d315c8f890.png	\N	2026-07-17 16:00:46.37287+00	2026-07-17 16:00:46.37287+00	2026-07-17 16:00:46.37287+00	{"eTag": "\\"9f3060045cfa69623a32166deb023561\\"", "size": 1617937, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-17T16:00:47.000Z", "contentLength": 1617937, "httpStatusCode": 200}	6b309eb1-41a8-46bf-8daf-8b4da94b0c25	\N	{}
9f7d51f7-439f-443f-bea1-3a638ff29a73	restaurant-logos	0e1bfac2-9652-4d81-b97e-4c313b588427/logo-1778436546546-662a3f5e-d1dd-4021-9aa5-091e47d817ed.png	\N	2026-05-10 18:09:07.906376+00	2026-05-10 18:09:07.906376+00	2026-05-10 18:09:07.906376+00	{"eTag": "\\"4a7c77fd3001d0b05194d5f1dbec4f6e\\"", "size": 923263, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-05-10T18:09:08.000Z", "contentLength": 923263, "httpStatusCode": 200}	2b44514a-4a08-4b4b-973b-3bb679ebbc39	\N	{}
be18b0be-b779-4604-9b9c-4b6ae49cece5	restaurant-logos	0e1bfac2-9652-4d81-b97e-4c313b588427/banner-1778436548083-c3277a94-3347-4539-b919-5a7040f8126e.png	\N	2026-05-10 18:09:09.046196+00	2026-05-10 18:09:09.046196+00	2026-05-10 18:09:09.046196+00	{"eTag": "\\"bbc341360773d6d4c7de2ded331722fb\\"", "size": 1069622, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-05-10T18:09:09.000Z", "contentLength": 1069622, "httpStatusCode": 200}	b8f62cb7-cc7b-4446-9e22-6d64dcb14182	\N	{}
708f6b10-f54b-4ac4-b242-5c1a26b5a45c	menu-items	d01685dd-bb48-4728-b14b-cd379b3939a5/1784304082665-bd9e950a-7e5a-41a2-aafb-c56de18168be.png	\N	2026-07-17 16:01:24.157725+00	2026-07-17 16:01:24.157725+00	2026-07-17 16:01:24.157725+00	{"eTag": "\\"a82ebf77911b74710bd251c871eca52a\\"", "size": 1655924, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-17T16:01:25.000Z", "contentLength": 1655924, "httpStatusCode": 200}	1619253a-fa8a-44cf-928e-8a7bdb88c0b3	\N	{}
27a20434-3936-4ea1-bbda-991a367de393	restaurant-logos	d4576dc8-e956-46a2-8a6b-dca1193845fd/logo-1778595167088-0e8350fe-a984-4f6e-9e4e-c4d1e236932b.png	\N	2026-05-12 14:12:49.468287+00	2026-05-12 14:12:49.468287+00	2026-05-12 14:12:49.468287+00	{"eTag": "\\"29a2412f254be50c93d7ac9e146db7b4\\"", "size": 1284776, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-05-12T14:12:50.000Z", "contentLength": 1284776, "httpStatusCode": 200}	ffa359bb-b647-4cc8-a3f6-126de1541a3c	\N	{}
0ffccb4e-f234-42a8-96f0-45880e4029f3	restaurant-logos	d4576dc8-e956-46a2-8a6b-dca1193845fd/banner-1778595260886-5332d3ab-9190-427a-ac6b-12a3fbfbc77c.png	\N	2026-05-12 14:14:23.393853+00	2026-05-12 14:14:23.393853+00	2026-05-12 14:14:23.393853+00	{"eTag": "\\"4d8aff18341e8921de9ae66b87b666b5\\"", "size": 2024233, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-05-12T14:14:24.000Z", "contentLength": 2024233, "httpStatusCode": 200}	e494422a-6b0c-45aa-9d34-e952df2f4fcf	\N	{}
90a0445e-20fe-491c-9232-c8b576f35117	menu-items	1d0d278c-7ef8-44ca-88a5-0813c41415bb/1778699787738-ac1ed1df-9620-4161-873c-474451ebdc32.png	\N	2026-05-13 19:16:28.708647+00	2026-05-13 19:16:28.708647+00	2026-05-13 19:16:28.708647+00	{"eTag": "\\"945eea0f9ac6786a134d8531cb08898f\\"", "size": 6550, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-05-13T19:16:29.000Z", "contentLength": 6550, "httpStatusCode": 200}	2c7b2ae7-7dad-4b85-b020-8e1d817d2f5b	\N	{}
5ed3897e-ee2e-4deb-a83d-60e0a69fe582	menu-items	d4576dc8-e956-46a2-8a6b-dca1193845fd/1778783504416-59db4c9e-91a0-4029-9d4c-75de9d352fd7.png	\N	2026-05-14 18:31:46.169689+00	2026-05-14 18:31:46.169689+00	2026-05-14 18:31:46.169689+00	{"eTag": "\\"951234db6218443a9dbfc13f0479b2ee\\"", "size": 12592, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-05-14T18:31:47.000Z", "contentLength": 12592, "httpStatusCode": 200}	0f2bd1b8-c873-4c45-a52c-072aa0637633	\N	{}
5eee5ace-0b85-445c-a9c4-d233c1ca279c	menu-items	d4576dc8-e956-46a2-8a6b-dca1193845fd/1778783681253-89d8519a-4c47-4be1-8223-0ddd67baf803.png	\N	2026-05-14 18:34:41.82798+00	2026-05-14 18:34:41.82798+00	2026-05-14 18:34:41.82798+00	{"eTag": "\\"951234db6218443a9dbfc13f0479b2ee\\"", "size": 12592, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-05-14T18:34:42.000Z", "contentLength": 12592, "httpStatusCode": 200}	b6554f05-2aa5-4c26-a9ed-992c17edf3f5	\N	{}
3c349aef-7bac-435f-82ca-5c1c1ffca3a9	menu-items	5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786386993057-2cc8663e-de53-4916-8e87-121ef9b1b15c.webp	\N	2026-08-10 18:36:35.054845+00	2026-08-10 18:36:35.054845+00	2026-08-10 18:36:35.054845+00	{"eTag": "\\"b2b4667f85ffeb0547923ca8cd278b19\\"", "size": 37056, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-08-10T18:36:36.000Z", "contentLength": 37056, "httpStatusCode": 200}	c2614256-19c2-4638-91f5-9549ebd9c600	\N	{}
5864024d-2ccb-4f4e-b71a-a5491b994fab	menu-items	d4576dc8-e956-46a2-8a6b-dca1193845fd/1778783821789-fbb7de58-ce35-4541-88d9-14ecdf0705cd.png	\N	2026-05-14 18:37:04.140945+00	2026-05-14 18:37:04.140945+00	2026-05-14 18:37:04.140945+00	{"eTag": "\\"951234db6218443a9dbfc13f0479b2ee\\"", "size": 12592, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-05-14T18:37:05.000Z", "contentLength": 12592, "httpStatusCode": 200}	cacdf009-8051-4007-81be-09e18ad6eddd	\N	{}
4226c206-e2b4-4f23-b872-0afb9b24dc75	menu-items	d4576dc8-e956-46a2-8a6b-dca1193845fd/1778915736607-51d4acd6-6e6b-43c4-abd9-dd960db06696.webp	\N	2026-05-16 07:15:37.342501+00	2026-05-16 07:15:37.342501+00	2026-05-16 07:15:37.342501+00	{"eTag": "\\"e9a55d7772c74e1217b06894b4a7cfb4\\"", "size": 25118, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-05-16T07:15:38.000Z", "contentLength": 25118, "httpStatusCode": 200}	94d30ecb-c31a-430d-aa93-f6ac5a4c3b7e	\N	{}
bac3922d-8a96-4794-9d6a-0bd3a082b03d	menu-items	5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786386998624-d9dbd300-eebd-4e86-934f-f8f81311aa3a.webp	\N	2026-08-10 18:36:39.063551+00	2026-08-10 18:36:39.063551+00	2026-08-10 18:36:39.063551+00	{"eTag": "\\"b2b4667f85ffeb0547923ca8cd278b19\\"", "size": 37056, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-08-10T18:36:40.000Z", "contentLength": 37056, "httpStatusCode": 200}	9d9a911b-5829-43f4-82b1-bdb62a8cdb32	\N	{}
b6df85ca-136c-4d90-b6d1-d891a8ab6b44	menu-items	d4576dc8-e956-46a2-8a6b-dca1193845fd/brand-1781342010806-8f7aed2f-2c6a-4b13-a55b-1acc2a9ee752.png	\N	2026-06-13 09:13:32.634589+00	2026-06-13 09:13:32.634589+00	2026-06-13 09:13:32.634589+00	{"eTag": "\\"cf8c28bd1f5fa4e693118f3150058430\\"", "size": 32674, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-13T09:13:33.000Z", "contentLength": 32674, "httpStatusCode": 200}	b50a9181-e315-4303-b275-2616d54dbc7b	\N	{}
725c21a0-f5ba-45d4-8b14-72d58dbd6fe0	menu-items	d4576dc8-e956-46a2-8a6b-dca1193845fd/1781342207720-44f99cdc-10bf-4bf3-b1ac-2a9ac5fa5104.jpeg	\N	2026-06-13 09:16:49.13974+00	2026-06-13 09:16:49.13974+00	2026-06-13 09:16:49.13974+00	{"eTag": "\\"f3c6294db423bdd4a6bfc75ac7020db4\\"", "size": 77704, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-13T09:16:50.000Z", "contentLength": 77704, "httpStatusCode": 200}	99e9aa19-fd6b-4153-a829-3f91d5908bc4	\N	{}
6c6b37a6-7b17-4c85-a751-bd7f366f4913	menu-items	5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786542024902-f9ea0242-d9c5-4863-b610-3b5464ae2779.jpg	\N	2026-08-12 13:40:26.950666+00	2026-08-12 13:40:26.950666+00	2026-08-12 13:40:26.950666+00	{"eTag": "\\"3b0ff0e4e753aebae9e6d304d40a6419\\"", "size": 24807, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T13:40:27.000Z", "contentLength": 24807, "httpStatusCode": 200}	3d199733-14bc-4269-803b-c557b54fdcc8	\N	{}
bb8221e1-a33e-42f6-bccd-19199934ea25	menu-items	d4576dc8-e956-46a2-8a6b-dca1193845fd/1781382911319-c5f4ce19-4963-45eb-a14f-64476171de4f.jpg	\N	2026-06-13 20:35:12.584168+00	2026-06-13 20:35:12.584168+00	2026-06-13 20:35:12.584168+00	{"eTag": "\\"2b2fbf31d94713869a82f159a407bc83\\"", "size": 60420, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-13T20:35:13.000Z", "contentLength": 60420, "httpStatusCode": 200}	13244905-e55e-4965-82ae-137b0b2ecd2a	\N	{}
fd34d13a-a856-45a1-838f-f93ba664b87c	menu-items	d4576dc8-e956-46a2-8a6b-dca1193845fd/1781382976654-95f6eb2c-b154-4e11-9003-110084871341.jpg	\N	2026-06-13 20:36:17.785653+00	2026-06-13 20:36:17.785653+00	2026-06-13 20:36:17.785653+00	{"eTag": "\\"951138cdf1df638e5010c09e9a58417b\\"", "size": 64311, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-13T20:36:18.000Z", "contentLength": 64311, "httpStatusCode": 200}	df6f6450-6b04-431e-8166-dff66a3d7ebe	\N	{}
5b2dd4c1-9baa-4725-9852-a923008b95c1	menu-items	d4576dc8-e956-46a2-8a6b-dca1193845fd/brand-1781383118627-2dabf0b3-a368-4b06-adc4-8529b33c971a.png	\N	2026-06-13 20:38:39.304313+00	2026-06-13 20:38:39.304313+00	2026-06-13 20:38:39.304313+00	{"eTag": "\\"fc30ed3a526175352de33968051f905b\\"", "size": 9986, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-13T20:38:40.000Z", "contentLength": 9986, "httpStatusCode": 200}	4fdd7e3e-b5b4-41ec-a769-b8bd7f968b0b	\N	{}
a3f64847-c998-4df7-bd50-f1ce17074d02	menu-items	d4576dc8-e956-46a2-8a6b-dca1193845fd/1781383226859-e1002f68-eff9-42e0-92d8-c08217f6506e.jpg	\N	2026-06-13 20:40:28.032724+00	2026-06-13 20:40:28.032724+00	2026-06-13 20:40:28.032724+00	{"eTag": "\\"4f04fa9dcf594a08d4d1351b0dad6850\\"", "size": 82824, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-13T20:40:28.000Z", "contentLength": 82824, "httpStatusCode": 200}	2c93e666-b312-4b31-931f-360531cd39c2	\N	{}
4d4c4bc8-f5b6-4873-904b-9da118a0f84b	menu-items	d4576dc8-e956-46a2-8a6b-dca1193845fd/brand-1781383544898-dbe7a522-43d3-441f-a284-43200542b1e1.png	\N	2026-06-13 20:45:45.919706+00	2026-06-13 20:45:45.919706+00	2026-06-13 20:45:45.919706+00	{"eTag": "\\"f7f81b98e2d1c85bff8ba0e729bcf2c0\\"", "size": 23813, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-13T20:45:46.000Z", "contentLength": 23813, "httpStatusCode": 200}	6db49ba2-9685-46a2-a521-04f88f447326	\N	{}
b879dc85-347d-4216-aed6-f2c97d89b94d	menu-items	5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786387001863-4b7ee698-8592-4e22-96d2-f9bb234e7535.webp	\N	2026-08-10 18:36:42.667055+00	2026-08-10 18:36:42.667055+00	2026-08-10 18:36:42.667055+00	{"eTag": "\\"b2b4667f85ffeb0547923ca8cd278b19\\"", "size": 37056, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-08-10T18:36:43.000Z", "contentLength": 37056, "httpStatusCode": 200}	aa1370aa-5bcc-4326-a690-c6804bdae875	\N	{}
ca6a0b9e-d6ed-4c83-adfc-569d43d72683	menu-items	d4576dc8-e956-46a2-8a6b-dca1193845fd/brand-1781383718773-6d5c55c9-5ac8-4f0f-8d9e-a4ff5480858a.png	\N	2026-06-13 20:48:40.160334+00	2026-06-13 20:48:40.160334+00	2026-06-13 20:48:40.160334+00	{"eTag": "\\"84eae44d42f252943509f53a92b7d449\\"", "size": 95666, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-13T20:48:41.000Z", "contentLength": 95666, "httpStatusCode": 200}	22c213ea-2037-455c-b3cf-a836dc7527b2	\N	{}
8075a8d1-1e1c-4bdb-a7ad-82d5b913812f	menu-items	5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786542024899-dff39658-7962-4bec-ad0b-73a15cf25fb6.jpg	\N	2026-08-12 13:40:27.85205+00	2026-08-12 13:40:27.85205+00	2026-08-12 13:40:27.85205+00	{"eTag": "\\"b50c54f6d2bb12c02d27ef78f93708fd\\"", "size": 26805, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T13:40:28.000Z", "contentLength": 26805, "httpStatusCode": 200}	43771469-3200-4c58-90be-4c8f8d7c4693	\N	{}
51c92532-6ca1-45b2-bbbb-8121ab7f2bdc	menu-items	d4576dc8-e956-46a2-8a6b-dca1193845fd/1781384092572-d1712705-3879-4a4b-b179-ed4b13ecd5fb.png	\N	2026-06-13 20:54:53.714753+00	2026-06-13 20:54:53.714753+00	2026-06-13 20:54:53.714753+00	{"eTag": "\\"ee551fe2c72cb3f693fff00a5a35e221\\"", "size": 5818, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-13T20:54:54.000Z", "contentLength": 5818, "httpStatusCode": 200}	19cf4a1c-8601-4d4c-b5c2-87f305d9d7af	\N	{}
fe2181ec-440d-4d82-9c89-01542a68e183	menu-items	5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786564535188-873df125-412d-4661-b468-ac4417ba6b46.jpg	\N	2026-08-12 19:55:37.226738+00	2026-08-12 19:55:37.226738+00	2026-08-12 19:55:37.226738+00	{"eTag": "\\"21da32f2e95daec79ffd1cf8265e00e1\\"", "size": 35182, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T19:55:38.000Z", "contentLength": 35182, "httpStatusCode": 200}	428be7f2-dbc8-4cbf-9fda-377a7aa83812	\N	{}
3aa2d05e-9be2-4937-8376-6a0a4ac452a1	menu-items	d4576dc8-e956-46a2-8a6b-dca1193845fd/brand-1781384586944-3b1c5353-ca82-4878-b5ab-d1094849d49c.png	\N	2026-06-13 21:03:08.023751+00	2026-06-13 21:03:08.023751+00	2026-06-13 21:03:08.023751+00	{"eTag": "\\"5f9a7f7a278f4701a284b0e84f6db97a\\"", "size": 226657, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-13T21:03:08.000Z", "contentLength": 226657, "httpStatusCode": 200}	07d731ef-bc8c-4f1a-b631-1e8cd1348895	\N	{}
ef193405-87fd-4f4d-a613-c662e1190b33	menu-items	d4576dc8-e956-46a2-8a6b-dca1193845fd/brand-1781384610518-18ab7ab6-fbef-426f-96a2-79cc1a382104.png	\N	2026-06-13 21:03:31.113864+00	2026-06-13 21:03:31.113864+00	2026-06-13 21:03:31.113864+00	{"eTag": "\\"ffd19fb13d720d21e5c73f5437730ef6\\"", "size": 10718, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-13T21:03:32.000Z", "contentLength": 10718, "httpStatusCode": 200}	fb0c7d9f-4572-4948-af9f-5a5549d3c65c	\N	{}
d0a244f2-75cc-42f8-ba52-77b9d6baff91	menu-items	d4576dc8-e956-46a2-8a6b-dca1193845fd/1781384819236-d1bc4c3b-3c65-4506-b057-4026a8f8e6ac.png	\N	2026-06-13 21:07:00.335212+00	2026-06-13 21:07:00.335212+00	2026-06-13 21:07:00.335212+00	{"eTag": "\\"d1c894334b55fcb01c3b115b7c75dd59\\"", "size": 74626, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-13T21:07:01.000Z", "contentLength": 74626, "httpStatusCode": 200}	433ef102-99a9-4599-9414-6cc12c0ef62a	\N	{}
c36167cd-d8f0-4602-b789-228e660cdd59	menu-items	d4576dc8-e956-46a2-8a6b-dca1193845fd/1781385218124-c901326e-4c34-4cb1-a7cd-9fd5cdc44e0d.png	\N	2026-06-13 21:13:39.34315+00	2026-06-13 21:13:39.34315+00	2026-06-13 21:13:39.34315+00	{"eTag": "\\"d1c894334b55fcb01c3b115b7c75dd59\\"", "size": 74626, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-13T21:13:40.000Z", "contentLength": 74626, "httpStatusCode": 200}	a8a2fdb2-7214-4b96-9009-a6e5cca82f90	\N	{}
2c1eaf1e-6b03-4b5b-b826-2fe7d3d0d455	menu-items	d4576dc8-e956-46a2-8a6b-dca1193845fd/1781385327948-01a1ef2c-5e4b-4321-938c-dc8d599da518.png	\N	2026-06-13 21:15:29.039046+00	2026-06-13 21:15:29.039046+00	2026-06-13 21:15:29.039046+00	{"eTag": "\\"0f7c1df7669a768d0f3a32f481045e85\\"", "size": 7876, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-06-13T21:15:29.000Z", "contentLength": 7876, "httpStatusCode": 200}	b04a6e9f-9091-4f5b-8c09-a6489588643b	\N	{}
ebc14a41-46eb-4666-85f7-804b0bc4da3c	restaurant-logos	897ac3c7-ee4e-41cf-bd51-c7996fc51614/logo-1781797917744-adc8dd85-8655-4cdd-bfde-fc19ce3fcff4.jpeg	\N	2026-06-18 15:51:58.358418+00	2026-06-18 15:51:58.358418+00	2026-06-18 15:51:58.358418+00	{"eTag": "\\"8806440edabe950f1a839e4ec00318a3\\"", "size": 24831, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-18T15:51:59.000Z", "contentLength": 24831, "httpStatusCode": 200}	25bb7f20-8bee-44de-9cba-a8bb89d94264	\N	{}
d57f4d61-c5b9-49b9-ad50-9d5fbe7823ec	restaurant-logos	5eb1ce0e-c35c-44b6-80fe-12b921849ce1/logo-1786438182724-dea67c83-beac-46b9-8a00-42e7f60da82d.png	\N	2026-08-11 08:49:48.199294+00	2026-08-11 08:49:48.199294+00	2026-08-11 08:49:48.199294+00	{"eTag": "\\"7a17e259887a512144b43f25d15ddc23\\"", "size": 2041825, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-11T08:49:49.000Z", "contentLength": 2041825, "httpStatusCode": 200}	be40726b-c8b5-4e05-9338-8a9cd9f9aef7	\N	{}
fe114956-4ea7-4c21-91fa-4ac9aaa24884	restaurant-logos	897ac3c7-ee4e-41cf-bd51-c7996fc51614/banner-1781797959616-0f9f4747-5816-4be6-858f-bd0c700a9d0f.jpeg	\N	2026-06-18 15:52:40.732358+00	2026-06-18 15:52:40.732358+00	2026-06-18 15:52:40.732358+00	{"eTag": "\\"8806440edabe950f1a839e4ec00318a3\\"", "size": 24831, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-18T15:52:41.000Z", "contentLength": 24831, "httpStatusCode": 200}	83114b22-69a7-4bad-84dc-05710f06f680	\N	{}
bd3b5167-b7dc-4f77-b435-d49d5e3e9c1a	restaurant-logos	897ac3c7-ee4e-41cf-bd51-c7996fc51614/logo-1781798077612-a6d56347-5935-4408-90ad-181964023d62.jpeg	\N	2026-06-18 15:54:39.049636+00	2026-06-18 15:54:39.049636+00	2026-06-18 15:54:39.049636+00	{"eTag": "\\"0f1fc4b65a76d14f02fff558e480ef1c\\"", "size": 171672, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-18T15:54:40.000Z", "contentLength": 171672, "httpStatusCode": 200}	b30c21c6-273b-4153-b84a-af31228307f2	\N	{}
fabbf9fe-526c-4eef-aa31-d15c44118286	restaurant-logos	5eb1ce0e-c35c-44b6-80fe-12b921849ce1/banner-1786438188468-49e0e75d-d118-4fb3-93f8-9030d7563dda.png	\N	2026-08-11 08:49:51.323066+00	2026-08-11 08:49:51.323066+00	2026-08-11 08:49:51.323066+00	{"eTag": "\\"9b21fd8a231bfb9696c72b3de8b112a8\\"", "size": 1805669, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-11T08:49:52.000Z", "contentLength": 1805669, "httpStatusCode": 200}	d212144e-0e77-44fc-b3c3-a9873bdfcc4b	\N	{}
8153bd40-b1d2-4551-8b3c-7e027eb4932f	restaurant-logos	e76c3f77-e172-48bc-8764-52e1c16c4d13/logo-1784136302683-e288c60f-e006-47a0-900a-432d3d084c0c.jpeg	\N	2026-07-15 17:25:04.182079+00	2026-07-15 17:25:04.182079+00	2026-07-15 17:25:04.182079+00	{"eTag": "\\"1a5a7eff8b8d3442a86d4f437ec7adaa\\"", "size": 178894, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-15T17:25:05.000Z", "contentLength": 178894, "httpStatusCode": 200}	0e5762a5-eb97-4553-9b84-1c1734fac30e	\N	{}
a5f18ac8-4c73-464a-96d5-c35ce7727f12	restaurant-logos	e76c3f77-e172-48bc-8764-52e1c16c4d13/banner-1784136304326-3df516f1-ff0b-4367-899c-31a7a16a8fef.jpeg	\N	2026-07-15 17:25:05.514363+00	2026-07-15 17:25:05.514363+00	2026-07-15 17:25:05.514363+00	{"eTag": "\\"a49fcd2a9dc53c4a90329f36040a9de4\\"", "size": 288880, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-15T17:25:06.000Z", "contentLength": 288880, "httpStatusCode": 200}	1a07133c-b340-43d8-b79f-9e0d60695bd0	\N	{}
3f876260-9374-4eb2-85ee-111596196dd1	restaurant-logos	5eb1ce0e-c35c-44b6-80fe-12b921849ce1/logo-1786438300173-62f87fe3-5459-4599-a50d-7253943aab1c.png	\N	2026-08-11 08:51:45.666103+00	2026-08-11 08:51:45.666103+00	2026-08-11 08:51:45.666103+00	{"eTag": "\\"7a17e259887a512144b43f25d15ddc23\\"", "size": 2041825, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-11T08:51:46.000Z", "contentLength": 2041825, "httpStatusCode": 200}	02dcb531-2b53-426f-b229-dc3136306069	\N	{}
92290909-2a8a-4424-9266-0ab61791c7ea	menu-items	e76c3f77-e172-48bc-8764-52e1c16c4d13/1784146762522-04d4ed7c-07bb-42e5-b6dc-0a511c39af17.png	\N	2026-07-15 20:19:24.678709+00	2026-07-15 20:19:24.678709+00	2026-07-15 20:19:24.678709+00	{"eTag": "\\"f844046f533f738d42df3a9f2255b504\\"", "size": 2108325, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-15T20:19:25.000Z", "contentLength": 2108325, "httpStatusCode": 200}	bb3a7662-d944-4e19-b31a-d74417b845cb	\N	{}
f746b1f2-64df-4628-b3c2-1c853021a77a	menu-items	e76c3f77-e172-48bc-8764-52e1c16c4d13/1784146864073-863f01dd-61b4-4a9e-8fb8-a1eccddb7e37.png	\N	2026-07-15 20:21:06.577543+00	2026-07-15 20:21:06.577543+00	2026-07-15 20:21:06.577543+00	{"eTag": "\\"f844046f533f738d42df3a9f2255b504\\"", "size": 2108325, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-15T20:21:07.000Z", "contentLength": 2108325, "httpStatusCode": 200}	fa83fa00-312c-4765-8e25-b7e27c178f08	\N	{}
2535479a-b368-4656-8589-d5ce4e3487a9	menu-items	e76c3f77-e172-48bc-8764-52e1c16c4d13/1784184175721-dae535bd-ea81-41b3-b3ae-cc5bc633d99b.png	\N	2026-07-16 06:42:57.572661+00	2026-07-16 06:42:57.572661+00	2026-07-16 06:42:57.572661+00	{"eTag": "\\"76cdf203d80f018df458d0fb6a666d37\\"", "size": 1587803, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-16T06:42:58.000Z", "contentLength": 1587803, "httpStatusCode": 200}	7e9e0251-3d12-434f-a927-65f2025bd9fb	\N	{}
b1bfe8f4-b0f9-4ccc-8c1e-30bd8987416d	menu-items	e76c3f77-e172-48bc-8764-52e1c16c4d13/1784215699955-4211c954-a19f-4d56-9c37-d035b33e7dea.png	\N	2026-07-16 15:28:23.325565+00	2026-07-16 15:28:23.325565+00	2026-07-16 15:28:23.325565+00	{"eTag": "\\"632745d6e2984233792ddea369067496\\"", "size": 1517628, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-16T15:28:24.000Z", "contentLength": 1517628, "httpStatusCode": 200}	6877f3b9-1c4f-4994-8658-2b8937f7587a	\N	{}
6ce696a1-ba5f-4a88-9b8c-d288e0d61914	restaurant-logos	5eb1ce0e-c35c-44b6-80fe-12b921849ce1/banner-1786438306494-3e7cde74-5c64-4832-9b3d-9fa561860e24.png	\N	2026-08-11 08:51:53.27137+00	2026-08-11 08:51:53.27137+00	2026-08-11 08:51:53.27137+00	{"eTag": "\\"9b21fd8a231bfb9696c72b3de8b112a8\\"", "size": 1805669, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-11T08:51:53.000Z", "contentLength": 1805669, "httpStatusCode": 200}	15521401-d65c-4ae1-9f14-e7eaabb1b59f	\N	{}
4cf8be3a-1e69-4fd9-b1c7-239aff9ce5b0	restaurant-logos	920a3ac4-62f6-4f2e-b2d2-a53a428bb7c8/logo-1784235460574-53625c60-5d29-488f-98ab-ad32e85b7252.jpeg	\N	2026-07-16 20:57:43.162292+00	2026-07-16 20:57:43.162292+00	2026-07-16 20:57:43.162292+00	{"eTag": "\\"1a5a7eff8b8d3442a86d4f437ec7adaa\\"", "size": 178894, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-16T20:57:44.000Z", "contentLength": 178894, "httpStatusCode": 200}	c904946c-a854-40e3-9973-076aad74e216	\N	{}
afd202d5-cae2-4c18-9192-5baed56f1758	restaurant-logos	920a3ac4-62f6-4f2e-b2d2-a53a428bb7c8/banner-1784235463324-88adc1ad-5950-4c61-8f95-f58cdc602043.jpeg	\N	2026-07-16 20:57:44.009635+00	2026-07-16 20:57:44.009635+00	2026-07-16 20:57:44.009635+00	{"eTag": "\\"a49fcd2a9dc53c4a90329f36040a9de4\\"", "size": 288880, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-16T20:57:44.000Z", "contentLength": 288880, "httpStatusCode": 200}	9c7a20c3-50d0-403c-a01f-dfcd51aab3aa	\N	{}
f5c02296-868f-46da-94f3-cfb38ba4fb99	menu-items	5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786563717702-87ed0d1f-597d-4c64-960c-303c10c04673.jpg	\N	2026-08-12 19:41:59.28334+00	2026-08-12 19:41:59.28334+00	2026-08-12 19:41:59.28334+00	{"eTag": "\\"b50c54f6d2bb12c02d27ef78f93708fd\\"", "size": 26805, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T19:42:00.000Z", "contentLength": 26805, "httpStatusCode": 200}	3d6afc6e-d67a-4d2f-8e8f-ebfc396afacc	\N	{}
7f395e84-f2b4-486b-8e3d-14c03895b63f	restaurant-logos	920a3ac4-62f6-4f2e-b2d2-a53a428bb7c8/logo-1784235489685-4cae2f85-bd91-40fe-95b8-641f7f6d4e0f.jpeg	\N	2026-07-16 20:58:10.811848+00	2026-07-16 20:58:10.811848+00	2026-07-16 20:58:10.811848+00	{"eTag": "\\"1a5a7eff8b8d3442a86d4f437ec7adaa\\"", "size": 178894, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-16T20:58:11.000Z", "contentLength": 178894, "httpStatusCode": 200}	c8c1d210-7a18-4121-bdeb-dba68d707aab	\N	{}
05c1a974-9e0b-4ac1-9a5c-2a53cdd9f4c9	restaurant-logos	920a3ac4-62f6-4f2e-b2d2-a53a428bb7c8/banner-1784235490951-3d4be9f0-cb6e-4a29-888e-af105beb03f1.jpeg	\N	2026-07-16 20:58:12.10397+00	2026-07-16 20:58:12.10397+00	2026-07-16 20:58:12.10397+00	{"eTag": "\\"a49fcd2a9dc53c4a90329f36040a9de4\\"", "size": 288880, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-16T20:58:13.000Z", "contentLength": 288880, "httpStatusCode": 200}	5fba1e40-86b5-4bab-a0db-47f3b4d990b5	\N	{}
a7eb8e2c-67ef-413f-9c3c-eb9fbe0f57fa	menu-items	5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786566100995-f0dbd5eb-151c-4e31-ae4f-720a90793c47.jpg	\N	2026-08-12 20:21:42.488394+00	2026-08-12 20:21:42.488394+00	2026-08-12 20:21:42.488394+00	{"eTag": "\\"760a42886f09bf39412c7086da56753f\\"", "size": 6725, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T20:21:43.000Z", "contentLength": 6725, "httpStatusCode": 200}	6d63c49b-a135-467a-8d8f-1672ae3f3fc7	\N	{}
5fc5b317-657c-44c1-ae9d-8c8a751ab934	restaurant-logos	d01685dd-bb48-4728-b14b-cd379b3939a5/logo-1784300676186-f7c2fa5d-e0fa-4b2b-875c-a4f3e44a7387.jpeg	\N	2026-07-17 15:04:37.837375+00	2026-07-17 15:04:37.837375+00	2026-07-17 15:04:37.837375+00	{"eTag": "\\"1a5a7eff8b8d3442a86d4f437ec7adaa\\"", "size": 178894, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-17T15:04:38.000Z", "contentLength": 178894, "httpStatusCode": 200}	13bb6478-47fc-40ca-917a-de18c07f68a4	\N	{}
e3f99021-73c6-4e01-a177-358f035188b1	restaurant-logos	d01685dd-bb48-4728-b14b-cd379b3939a5/banner-1784300677986-6c18f0fe-04b1-4bdb-8cee-5134ef409bad.jpeg	\N	2026-07-17 15:04:39.167069+00	2026-07-17 15:04:39.167069+00	2026-07-17 15:04:39.167069+00	{"eTag": "\\"a49fcd2a9dc53c4a90329f36040a9de4\\"", "size": 288880, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-17T15:04:40.000Z", "contentLength": 288880, "httpStatusCode": 200}	e1fabdec-f07e-4be9-9a86-44d30bf681cb	\N	{}
50379c53-b037-4c48-9802-97357c989578	menu-items	d01685dd-bb48-4728-b14b-cd379b3939a5/brand-1784302718160-bc5e5ac9-ef1e-4452-8474-922d8e656fdc.jpeg	\N	2026-07-17 15:38:38.758001+00	2026-07-17 15:38:38.758001+00	2026-07-17 15:38:38.758001+00	{"eTag": "\\"76d86b061f4b99c64869542a89333472\\"", "size": 9663, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-17T15:38:39.000Z", "contentLength": 9663, "httpStatusCode": 200}	d7862922-00cd-4e93-93a3-5dc0d7614b7a	\N	{}
f712b9f2-8347-4857-9735-b76eab22e341	menu-items	d01685dd-bb48-4728-b14b-cd379b3939a5/1784302897961-9521f223-deb8-4576-af94-d269e49e3d0f.jpeg	\N	2026-07-17 15:41:38.408074+00	2026-07-17 15:41:38.408074+00	2026-07-17 15:41:38.408074+00	{"eTag": "\\"bfcebdc9772f7e471713e8a2d8c46b01\\"", "size": 95120, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-17T15:41:39.000Z", "contentLength": 95120, "httpStatusCode": 200}	e201e191-f819-4e61-ad70-bbb399169099	\N	{}
bcb9ff4e-3fc7-4bd3-941b-1bac79907fff	menu-items	d01685dd-bb48-4728-b14b-cd379b3939a5/1784303587580-dccd55f9-cc99-4beb-88eb-470b78e049af.png	\N	2026-07-17 15:53:10.338686+00	2026-07-17 15:53:10.338686+00	2026-07-17 15:53:10.338686+00	{"eTag": "\\"381baf5b1b7f66c1618f7b1b5d44ce7a\\"", "size": 2905974, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-17T15:53:11.000Z", "contentLength": 2905974, "httpStatusCode": 200}	ba93f8ff-d24c-4f6c-855d-decf2c123cbf	\N	{}
2e068501-4b86-4523-b6fe-be48734de9a3	menu-items	5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786455603906-c444622a-1fca-4945-9e89-4572d1512d30.jpg	\N	2026-08-11 13:40:05.789435+00	2026-08-11 13:40:05.789435+00	2026-08-11 13:40:05.789435+00	{"eTag": "\\"aecb7f96b7f67e2a7ae222955b8f91d8\\"", "size": 74441, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-11T13:40:06.000Z", "contentLength": 74441, "httpStatusCode": 200}	fbd82d95-cdf8-47e0-8cdd-0274ea24e1db	\N	{}
37f645a7-f7a3-4403-b082-305878feb1ea	menu-items	5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786455603910-bf1a075f-a6da-4ceb-8852-60665d55f54f.jpg	\N	2026-08-11 13:40:05.844323+00	2026-08-11 13:40:05.844323+00	2026-08-11 13:40:05.844323+00	{"eTag": "\\"1906c2d96ed613ba59ce624f53d0e9dd\\"", "size": 84661, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-11T13:40:06.000Z", "contentLength": 84661, "httpStatusCode": 200}	0841c7c3-d5f2-4c4f-92bd-1a5e1c8300eb	\N	{}
1affedb4-234a-481f-baca-710648e2b123	menu-items	5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786455603910-7842a259-9274-4764-9fb4-8a9898dfea4a.jpg	\N	2026-08-11 13:40:06.039907+00	2026-08-11 13:40:06.039907+00	2026-08-11 13:40:06.039907+00	{"eTag": "\\"8434dbc952a60f825d84a82432035311\\"", "size": 90341, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-11T13:40:06.000Z", "contentLength": 90341, "httpStatusCode": 200}	955131f6-db58-45d9-ae97-cb320b24716e	\N	{}
9cf451f1-9d14-4b0b-9e85-6facb7d4bf4d	menu-items	5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786455606047-ae9bd6cc-22e7-4d78-a775-5c1f4cb30d6d.jpg	\N	2026-08-11 13:40:06.73687+00	2026-08-11 13:40:06.73687+00	2026-08-11 13:40:06.73687+00	{"eTag": "\\"aecb7f96b7f67e2a7ae222955b8f91d8\\"", "size": 74441, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-11T13:40:07.000Z", "contentLength": 74441, "httpStatusCode": 200}	bc427c3a-c43b-440e-a574-173ce031072d	\N	{}
105795e8-f55b-43d7-b599-9ee68f3e89d5	menu-items	5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786563717708-ffea5315-c8e4-441c-9cec-98b7ceaf01d8.jpg	\N	2026-08-12 19:41:59.285548+00	2026-08-12 19:41:59.285548+00	2026-08-12 19:41:59.285548+00	{"eTag": "\\"3b0ff0e4e753aebae9e6d304d40a6419\\"", "size": 24807, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T19:42:00.000Z", "contentLength": 24807, "httpStatusCode": 200}	693ea9c2-fabf-48ed-be10-3e5a51d8b080	\N	{}
b6589069-3426-4fdd-acc1-f64d7d378f4b	menu-items	5eb1ce0e-c35c-44b6-80fe-12b921849ce1/1786568280705-025060ab-7792-42c5-a2fb-a76d9650f194.png	\N	2026-08-12 20:58:03.404808+00	2026-08-12 20:58:03.404808+00	2026-08-12 20:58:03.404808+00	{"eTag": "\\"755528c125df7e59635d7456aba71f8b\\"", "size": 801579, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T20:58:04.000Z", "contentLength": 801579, "httpStatusCode": 200}	588e6925-9a60-49fd-a223-3b0a99189444	\N	{}
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 795, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_realtime_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: accounting_expenses accounting_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounting_expenses
    ADD CONSTRAINT accounting_expenses_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: club_check_ins club_check_ins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_check_ins
    ADD CONSTRAINT club_check_ins_pkey PRIMARY KEY (id);


--
-- Name: club_invoices club_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_invoices
    ADD CONSTRAINT club_invoices_pkey PRIMARY KEY (id);


--
-- Name: club_members club_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_members
    ADD CONSTRAINT club_members_pkey PRIMARY KEY (id);


--
-- Name: club_plans club_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_plans
    ADD CONSTRAINT club_plans_pkey PRIMARY KEY (id);


--
-- Name: crm_customer_notes crm_customer_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_customer_notes
    ADD CONSTRAINT crm_customer_notes_pkey PRIMARY KEY (id);


--
-- Name: crm_customer_tag_assignments crm_customer_tag_assignments_customer_id_tag_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_customer_tag_assignments
    ADD CONSTRAINT crm_customer_tag_assignments_customer_id_tag_id_key UNIQUE (customer_id, tag_id);


--
-- Name: crm_customer_tag_assignments crm_customer_tag_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_customer_tag_assignments
    ADD CONSTRAINT crm_customer_tag_assignments_pkey PRIMARY KEY (id);


--
-- Name: crm_customers crm_customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_customers
    ADD CONSTRAINT crm_customers_pkey PRIMARY KEY (id);


--
-- Name: crm_tags crm_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_tags
    ADD CONSTRAINT crm_tags_pkey PRIMARY KEY (id);


--
-- Name: crm_tags crm_tags_restaurant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_tags
    ADD CONSTRAINT crm_tags_restaurant_id_name_key UNIQUE (restaurant_id, name);


--
-- Name: customer_addresses customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (id);


--
-- Name: customer_profiles customer_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_profiles
    ADD CONSTRAINT customer_profiles_pkey PRIMARY KEY (id);


--
-- Name: customer_signup_otps customer_signup_otps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_signup_otps
    ADD CONSTRAINT customer_signup_otps_pkey PRIMARY KEY (id);


--
-- Name: restaurant_delivery_tiers delivery_tiers_no_overlap; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_delivery_tiers
    ADD CONSTRAINT delivery_tiers_no_overlap EXCLUDE USING gist (restaurant_id WITH =, numrange((min_distance_km)::numeric, (max_distance_km)::numeric, '[)'::text) WITH &&);


--
-- Name: ecommerce_delivery_zones ecommerce_delivery_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecommerce_delivery_zones
    ADD CONSTRAINT ecommerce_delivery_zones_pkey PRIMARY KEY (id);


--
-- Name: ecommerce_order_items ecommerce_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecommerce_order_items
    ADD CONSTRAINT ecommerce_order_items_pkey PRIMARY KEY (id);


--
-- Name: ecommerce_orders ecommerce_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecommerce_orders
    ADD CONSTRAINT ecommerce_orders_pkey PRIMARY KEY (id);


--
-- Name: ecommerce_stores ecommerce_stores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecommerce_stores
    ADD CONSTRAINT ecommerce_stores_pkey PRIMARY KEY (id);


--
-- Name: ecommerce_stores ecommerce_stores_restaurant_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecommerce_stores
    ADD CONSTRAINT ecommerce_stores_restaurant_id_key UNIQUE (restaurant_id);


--
-- Name: event_booking_packages event_booking_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_booking_packages
    ADD CONSTRAINT event_booking_packages_pkey PRIMARY KEY (id);


--
-- Name: event_bookings event_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_bookings
    ADD CONSTRAINT event_bookings_pkey PRIMARY KEY (id);


--
-- Name: event_packages event_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_packages
    ADD CONSTRAINT event_packages_pkey PRIMARY KEY (id);


--
-- Name: event_spaces event_spaces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_spaces
    ADD CONSTRAINT event_spaces_pkey PRIMARY KEY (id);


--
-- Name: restaurant_fast_delivery_tiers fast_delivery_tiers_no_overlap; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_fast_delivery_tiers
    ADD CONSTRAINT fast_delivery_tiers_no_overlap EXCLUDE USING gist (restaurant_id WITH =, numrange((min_distance_km)::numeric, (max_distance_km)::numeric, '[)'::text) WITH &&);


--
-- Name: fleet_deliveries fleet_deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleet_deliveries
    ADD CONSTRAINT fleet_deliveries_pkey PRIMARY KEY (id);


--
-- Name: fleet_drivers fleet_drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleet_drivers
    ADD CONSTRAINT fleet_drivers_pkey PRIMARY KEY (id);


--
-- Name: fleet_vehicle_logs fleet_vehicle_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleet_vehicle_logs
    ADD CONSTRAINT fleet_vehicle_logs_pkey PRIMARY KEY (id);


--
-- Name: fleet_vehicles fleet_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleet_vehicles
    ADD CONSTRAINT fleet_vehicles_pkey PRIMARY KEY (id);


--
-- Name: fleet_vehicles fleet_vehicles_restaurant_id_plate_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleet_vehicles
    ADD CONSTRAINT fleet_vehicles_restaurant_id_plate_number_key UNIQUE (restaurant_id, plate_number);


--
-- Name: gym_member_packages gym_member_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_member_packages
    ADD CONSTRAINT gym_member_packages_pkey PRIMARY KEY (id);


--
-- Name: gym_pt_packages gym_pt_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_pt_packages
    ADD CONSTRAINT gym_pt_packages_pkey PRIMARY KEY (id);


--
-- Name: gym_pt_sessions gym_pt_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_pt_sessions
    ADD CONSTRAINT gym_pt_sessions_pkey PRIMARY KEY (id);


--
-- Name: gym_trainer_payouts gym_trainer_payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_trainer_payouts
    ADD CONSTRAINT gym_trainer_payouts_pkey PRIMARY KEY (id);


--
-- Name: gym_trainers gym_trainers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_trainers
    ADD CONSTRAINT gym_trainers_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: loyalty_members loyalty_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_members
    ADD CONSTRAINT loyalty_members_pkey PRIMARY KEY (id);


--
-- Name: loyalty_members loyalty_members_restaurant_id_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_members
    ADD CONSTRAINT loyalty_members_restaurant_id_phone_key UNIQUE (restaurant_id, phone);


--
-- Name: loyalty_programs loyalty_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_programs
    ADD CONSTRAINT loyalty_programs_pkey PRIMARY KEY (id);


--
-- Name: loyalty_programs loyalty_programs_restaurant_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_programs
    ADD CONSTRAINT loyalty_programs_restaurant_id_key UNIQUE (restaurant_id);


--
-- Name: loyalty_transactions loyalty_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_pkey PRIMARY KEY (id);


--
-- Name: menu_brands menu_brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_brands
    ADD CONSTRAINT menu_brands_pkey PRIMARY KEY (id);


--
-- Name: menu_brands menu_brands_restaurant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_brands
    ADD CONSTRAINT menu_brands_restaurant_id_name_key UNIQUE (restaurant_id, name);


--
-- Name: menu_coupon_codes menu_coupon_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_coupon_codes
    ADD CONSTRAINT menu_coupon_codes_pkey PRIMARY KEY (id);


--
-- Name: menu_coupon_codes menu_coupon_codes_restaurant_id_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_coupon_codes
    ADD CONSTRAINT menu_coupon_codes_restaurant_id_code_key UNIQUE (restaurant_id, code);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- Name: menu_promotions menu_promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_promotions
    ADD CONSTRAINT menu_promotions_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: password_change_otps password_change_otps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_change_otps
    ADD CONSTRAINT password_change_otps_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payroll_entries payroll_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_entries
    ADD CONSTRAINT payroll_entries_pkey PRIMARY KEY (id);


--
-- Name: payroll_runs payroll_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_pkey PRIMARY KEY (id);


--
-- Name: platform_ops_payment_reminder_log platform_ops_payment_reminder_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_ops_payment_reminder_log
    ADD CONSTRAINT platform_ops_payment_reminder_log_pkey PRIMARY KEY (id);


--
-- Name: platform_ops_payment_reminder_log platform_ops_payment_reminder_payment_id_reminder_kind_due__key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_ops_payment_reminder_log
    ADD CONSTRAINT platform_ops_payment_reminder_payment_id_reminder_kind_due__key UNIQUE (payment_id, reminder_kind, due_at);


--
-- Name: platform_ops_payments platform_ops_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_ops_payments
    ADD CONSTRAINT platform_ops_payments_pkey PRIMARY KEY (id);


--
-- Name: pms_charges pms_charges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_charges
    ADD CONSTRAINT pms_charges_pkey PRIMARY KEY (id);


--
-- Name: pms_housekeeping_logs pms_housekeeping_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_housekeeping_logs
    ADD CONSTRAINT pms_housekeeping_logs_pkey PRIMARY KEY (id);


--
-- Name: pms_reservations pms_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_reservations
    ADD CONSTRAINT pms_reservations_pkey PRIMARY KEY (id);


--
-- Name: pms_room_types pms_room_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_room_types
    ADD CONSTRAINT pms_room_types_pkey PRIMARY KEY (id);


--
-- Name: pms_rooms pms_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_rooms
    ADD CONSTRAINT pms_rooms_pkey PRIMARY KEY (id);


--
-- Name: pms_rooms pms_rooms_restaurant_id_room_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_rooms
    ADD CONSTRAINT pms_rooms_restaurant_id_room_number_key UNIQUE (restaurant_id, room_number);


--
-- Name: pos_order_items pos_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_order_items
    ADD CONSTRAINT pos_order_items_pkey PRIMARY KEY (id);


--
-- Name: pos_orders pos_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_orders
    ADD CONSTRAINT pos_orders_pkey PRIMARY KEY (id);


--
-- Name: pos_payments pos_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_payments
    ADD CONSTRAINT pos_payments_pkey PRIMARY KEY (id);


--
-- Name: pos_sessions pos_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_sessions
    ADD CONSTRAINT pos_sessions_pkey PRIMARY KEY (id);


--
-- Name: restaurant_addons restaurant_addons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_addons
    ADD CONSTRAINT restaurant_addons_pkey PRIMARY KEY (id);


--
-- Name: restaurant_addons restaurant_addons_restaurant_id_addon_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_addons
    ADD CONSTRAINT restaurant_addons_restaurant_id_addon_key_key UNIQUE (restaurant_id, addon_key);


--
-- Name: restaurant_delivery_tiers restaurant_delivery_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_delivery_tiers
    ADD CONSTRAINT restaurant_delivery_tiers_pkey PRIMARY KEY (id);


--
-- Name: restaurant_drivers restaurant_drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_drivers
    ADD CONSTRAINT restaurant_drivers_pkey PRIMARY KEY (id);


--
-- Name: restaurant_employees restaurant_employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_employees
    ADD CONSTRAINT restaurant_employees_pkey PRIMARY KEY (id);


--
-- Name: restaurant_fast_delivery_tiers restaurant_fast_delivery_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_fast_delivery_tiers
    ADD CONSTRAINT restaurant_fast_delivery_tiers_pkey PRIMARY KEY (id);


--
-- Name: restaurant_locations restaurant_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_locations
    ADD CONSTRAINT restaurant_locations_pkey PRIMARY KEY (id);


--
-- Name: restaurant_ratings restaurant_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_ratings
    ADD CONSTRAINT restaurant_ratings_pkey PRIMARY KEY (id);


--
-- Name: restaurant_ratings restaurant_ratings_restaurant_id_rater_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_ratings
    ADD CONSTRAINT restaurant_ratings_restaurant_id_rater_id_key UNIQUE (restaurant_id, rater_id);


--
-- Name: restaurant_stock_sync restaurant_stock_sync_inbound_api_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_stock_sync
    ADD CONSTRAINT restaurant_stock_sync_inbound_api_key_key UNIQUE (inbound_api_key);


--
-- Name: restaurant_stock_sync restaurant_stock_sync_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_stock_sync
    ADD CONSTRAINT restaurant_stock_sync_pkey PRIMARY KEY (id);


--
-- Name: restaurant_stock_sync restaurant_stock_sync_restaurant_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_stock_sync
    ADD CONSTRAINT restaurant_stock_sync_restaurant_id_key UNIQUE (restaurant_id);


--
-- Name: restaurant_subscriptions restaurant_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_subscriptions
    ADD CONSTRAINT restaurant_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: restaurants restaurants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_pkey PRIMARY KEY (id);


--
-- Name: restaurants restaurants_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_slug_key UNIQUE (slug);


--
-- Name: retail_daily_closes retail_daily_closes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.retail_daily_closes
    ADD CONSTRAINT retail_daily_closes_pkey PRIMARY KEY (id);


--
-- Name: stock_sync_events stock_sync_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_sync_events
    ADD CONSTRAINT stock_sync_events_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_name_key UNIQUE (name);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscription_reminder_log subscription_reminder_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_reminder_log
    ADD CONSTRAINT subscription_reminder_log_pkey PRIMARY KEY (id);


--
-- Name: subscription_reminder_log subscription_reminder_log_subscription_id_reminder_kind_due_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_reminder_log
    ADD CONSTRAINT subscription_reminder_log_subscription_id_reminder_kind_due_key UNIQUE (subscription_id, reminder_kind, due_at);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: table_reservations table_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_reservations
    ADD CONSTRAINT table_reservations_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_08_04 messages_2026_08_04_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_08_04
    ADD CONSTRAINT messages_2026_08_04_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_08_05 messages_2026_08_05_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_08_05
    ADD CONSTRAINT messages_2026_08_05_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_08_06 messages_2026_08_06_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_08_06
    ADD CONSTRAINT messages_2026_08_06_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_08_07 messages_2026_08_07_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_08_07
    ADD CONSTRAINT messages_2026_08_07_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_08_08 messages_2026_08_08_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_08_08
    ADD CONSTRAINT messages_2026_08_08_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_08_09 messages_2026_08_09_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_08_09
    ADD CONSTRAINT messages_2026_08_09_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_08_10 messages_2026_08_10_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_08_10
    ADD CONSTRAINT messages_2026_08_10_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages messages_payload_exclusive; Type: CHECK CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages
    ADD CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALID;


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: idx_users_created_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- Name: idx_users_last_sign_in_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC);


--
-- Name: idx_users_name; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: idx_accounting_expenses_occurred_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accounting_expenses_occurred_at ON public.accounting_expenses USING btree (occurred_at DESC);


--
-- Name: idx_accounting_expenses_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accounting_expenses_restaurant_id ON public.accounting_expenses USING btree (restaurant_id);


--
-- Name: idx_club_check_ins_member; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_club_check_ins_member ON public.club_check_ins USING btree (member_id, checked_in_at DESC);


--
-- Name: idx_club_check_ins_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_club_check_ins_restaurant ON public.club_check_ins USING btree (restaurant_id, checked_in_at DESC);


--
-- Name: idx_club_invoices_member; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_club_invoices_member ON public.club_invoices USING btree (member_id);


--
-- Name: idx_club_invoices_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_club_invoices_status ON public.club_invoices USING btree (restaurant_id, status);


--
-- Name: idx_club_members_plan; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_club_members_plan ON public.club_members USING btree (plan_id);


--
-- Name: idx_club_members_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_club_members_restaurant ON public.club_members USING btree (restaurant_id);


--
-- Name: idx_club_members_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_club_members_status ON public.club_members USING btree (restaurant_id, status);


--
-- Name: idx_club_plans_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_club_plans_restaurant ON public.club_plans USING btree (restaurant_id);


--
-- Name: idx_crm_customer_notes_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_crm_customer_notes_customer_id ON public.crm_customer_notes USING btree (customer_id);


--
-- Name: idx_crm_customer_tag_assignments_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_crm_customer_tag_assignments_customer_id ON public.crm_customer_tag_assignments USING btree (customer_id);


--
-- Name: idx_crm_customers_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_crm_customers_email ON public.crm_customers USING btree (restaurant_id, email) WHERE (email IS NOT NULL);


--
-- Name: idx_crm_customers_is_vip; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_crm_customers_is_vip ON public.crm_customers USING btree (restaurant_id, is_vip);


--
-- Name: idx_crm_customers_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_crm_customers_phone ON public.crm_customers USING btree (restaurant_id, phone) WHERE (phone IS NOT NULL);


--
-- Name: idx_crm_customers_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_crm_customers_restaurant_id ON public.crm_customers USING btree (restaurant_id);


--
-- Name: idx_crm_tags_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_crm_tags_restaurant_id ON public.crm_tags USING btree (restaurant_id);


--
-- Name: idx_customer_addresses_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_addresses_customer_id ON public.customer_addresses USING btree (customer_id);


--
-- Name: idx_customer_signup_otps_expires; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_signup_otps_expires ON public.customer_signup_otps USING btree (expires_at);


--
-- Name: idx_customer_signup_otps_user_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_signup_otps_user_created ON public.customer_signup_otps USING btree (user_id, created_at DESC);


--
-- Name: idx_delivery_tiers_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_tiers_position ON public.restaurant_delivery_tiers USING btree (restaurant_id, "position");


--
-- Name: idx_delivery_tiers_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_tiers_restaurant_id ON public.restaurant_delivery_tiers USING btree (restaurant_id);


--
-- Name: idx_ecommerce_order_items_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ecommerce_order_items_order ON public.ecommerce_order_items USING btree (order_id);


--
-- Name: idx_ecommerce_orders_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ecommerce_orders_restaurant ON public.ecommerce_orders USING btree (restaurant_id, created_at DESC);


--
-- Name: idx_ecommerce_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ecommerce_orders_status ON public.ecommerce_orders USING btree (restaurant_id, status);


--
-- Name: idx_ecommerce_zones_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ecommerce_zones_restaurant ON public.ecommerce_delivery_zones USING btree (restaurant_id);


--
-- Name: idx_event_booking_packages_booking_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_booking_packages_booking_id ON public.event_booking_packages USING btree (booking_id);


--
-- Name: idx_event_bookings_restaurant_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_bookings_restaurant_date ON public.event_bookings USING btree (restaurant_id, event_date);


--
-- Name: idx_event_bookings_space_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_bookings_space_id ON public.event_bookings USING btree (space_id) WHERE (space_id IS NOT NULL);


--
-- Name: idx_event_bookings_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_bookings_status ON public.event_bookings USING btree (restaurant_id, status);


--
-- Name: idx_event_packages_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_packages_restaurant_id ON public.event_packages USING btree (restaurant_id);


--
-- Name: idx_event_spaces_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_spaces_restaurant_id ON public.event_spaces USING btree (restaurant_id);


--
-- Name: idx_fast_delivery_tiers_position; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fast_delivery_tiers_position ON public.restaurant_fast_delivery_tiers USING btree (restaurant_id, "position");


--
-- Name: idx_fast_delivery_tiers_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fast_delivery_tiers_restaurant_id ON public.restaurant_fast_delivery_tiers USING btree (restaurant_id);


--
-- Name: idx_fleet_deliveries_driver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fleet_deliveries_driver ON public.fleet_deliveries USING btree (driver_id);


--
-- Name: idx_fleet_deliveries_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fleet_deliveries_restaurant ON public.fleet_deliveries USING btree (restaurant_id, assigned_at DESC);


--
-- Name: idx_fleet_deliveries_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fleet_deliveries_status ON public.fleet_deliveries USING btree (restaurant_id, status);


--
-- Name: idx_fleet_drivers_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fleet_drivers_restaurant ON public.fleet_drivers USING btree (restaurant_id);


--
-- Name: idx_fleet_vehicle_logs_vehicle; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fleet_vehicle_logs_vehicle ON public.fleet_vehicle_logs USING btree (vehicle_id, log_date DESC);


--
-- Name: idx_fleet_vehicles_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fleet_vehicles_restaurant ON public.fleet_vehicles USING btree (restaurant_id);


--
-- Name: idx_gym_member_packages_member; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gym_member_packages_member ON public.gym_member_packages USING btree (club_member_id);


--
-- Name: idx_gym_member_packages_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gym_member_packages_restaurant ON public.gym_member_packages USING btree (restaurant_id, purchase_date DESC);


--
-- Name: idx_gym_payouts_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gym_payouts_restaurant ON public.gym_trainer_payouts USING btree (restaurant_id, period_start DESC);


--
-- Name: idx_gym_sessions_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gym_sessions_restaurant ON public.gym_pt_sessions USING btree (restaurant_id, scheduled_at DESC);


--
-- Name: idx_gym_sessions_trainer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gym_sessions_trainer ON public.gym_pt_sessions USING btree (trainer_id, scheduled_at DESC);


--
-- Name: idx_gym_trainers_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gym_trainers_restaurant ON public.gym_trainers USING btree (restaurant_id);


--
-- Name: idx_inventory_items_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_items_restaurant_id ON public.inventory_items USING btree (restaurant_id);


--
-- Name: idx_inventory_movements_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_created_at ON public.inventory_movements USING btree (created_at DESC);


--
-- Name: idx_inventory_movements_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_item_id ON public.inventory_movements USING btree (item_id);


--
-- Name: idx_inventory_movements_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_movements_restaurant_id ON public.inventory_movements USING btree (restaurant_id);


--
-- Name: idx_invoices_due_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invoices_due_at ON public.invoices USING btree (due_at);


--
-- Name: idx_invoices_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invoices_restaurant_id ON public.invoices USING btree (restaurant_id);


--
-- Name: idx_invoices_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);


--
-- Name: idx_loyalty_members_crm_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_loyalty_members_crm_customer ON public.loyalty_members USING btree (crm_customer_id) WHERE (crm_customer_id IS NOT NULL);


--
-- Name: idx_loyalty_members_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_loyalty_members_phone ON public.loyalty_members USING btree (restaurant_id, phone) WHERE (phone IS NOT NULL);


--
-- Name: idx_loyalty_members_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_loyalty_members_restaurant_id ON public.loyalty_members USING btree (restaurant_id);


--
-- Name: idx_loyalty_transactions_member_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_loyalty_transactions_member_id ON public.loyalty_transactions USING btree (member_id);


--
-- Name: idx_loyalty_transactions_pos_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_loyalty_transactions_pos_order_id ON public.loyalty_transactions USING btree (pos_order_id) WHERE (pos_order_id IS NOT NULL);


--
-- Name: idx_loyalty_transactions_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_loyalty_transactions_restaurant_id ON public.loyalty_transactions USING btree (restaurant_id, created_at DESC);


--
-- Name: idx_menu_brands_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_brands_restaurant_id ON public.menu_brands USING btree (restaurant_id);


--
-- Name: idx_menu_coupon_codes_lookup; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_coupon_codes_lookup ON public.menu_coupon_codes USING btree (restaurant_id, code);


--
-- Name: idx_menu_coupon_codes_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_coupon_codes_restaurant_id ON public.menu_coupon_codes USING btree (restaurant_id);


--
-- Name: idx_menu_items_brand_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_brand_id ON public.menu_items USING btree (brand_id);


--
-- Name: idx_menu_items_restaurant_external_sku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_menu_items_restaurant_external_sku ON public.menu_items USING btree (restaurant_id, external_sku) WHERE (external_sku IS NOT NULL);


--
-- Name: idx_menu_promotions_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_promotions_restaurant_id ON public.menu_promotions USING btree (restaurant_id);


--
-- Name: idx_menu_promotions_scope; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_promotions_scope ON public.menu_promotions USING btree (restaurant_id, scope_type, scope_id);


--
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);


--
-- Name: idx_orders_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_customer_id ON public.orders USING btree (customer_id);


--
-- Name: idx_orders_driver_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_driver_id ON public.orders USING btree (restaurant_id, driver_id);


--
-- Name: idx_orders_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_restaurant_id ON public.orders USING btree (restaurant_id);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_payments_paid_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_paid_at ON public.payments USING btree (paid_at);


--
-- Name: idx_payments_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_restaurant_id ON public.payments USING btree (restaurant_id);


--
-- Name: idx_payroll_entries_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payroll_entries_restaurant_id ON public.payroll_entries USING btree (restaurant_id);


--
-- Name: idx_payroll_runs_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payroll_runs_restaurant_id ON public.payroll_runs USING btree (restaurant_id);


--
-- Name: idx_platform_ops_payment_reminder_log_payment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_platform_ops_payment_reminder_log_payment_id ON public.platform_ops_payment_reminder_log USING btree (payment_id);


--
-- Name: idx_platform_ops_payments_due_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_platform_ops_payments_due_at ON public.platform_ops_payments USING btree (due_at);


--
-- Name: idx_platform_ops_payments_unpaid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_platform_ops_payments_unpaid ON public.platform_ops_payments USING btree (due_at) WHERE (paid_at IS NULL);


--
-- Name: idx_pms_charges_reservation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pms_charges_reservation ON public.pms_charges USING btree (reservation_id);


--
-- Name: idx_pms_housekeeping_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pms_housekeeping_restaurant ON public.pms_housekeeping_logs USING btree (restaurant_id, scheduled_date);


--
-- Name: idx_pms_housekeeping_room; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pms_housekeeping_room ON public.pms_housekeeping_logs USING btree (room_id, scheduled_date);


--
-- Name: idx_pms_reservations_restaurant_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pms_reservations_restaurant_dates ON public.pms_reservations USING btree (restaurant_id, check_in_date, check_out_date);


--
-- Name: idx_pms_reservations_room_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pms_reservations_room_id ON public.pms_reservations USING btree (room_id);


--
-- Name: idx_pms_reservations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pms_reservations_status ON public.pms_reservations USING btree (restaurant_id, status);


--
-- Name: idx_pms_room_types_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pms_room_types_restaurant ON public.pms_room_types USING btree (restaurant_id);


--
-- Name: idx_pms_rooms_restaurant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pms_rooms_restaurant ON public.pms_rooms USING btree (restaurant_id);


--
-- Name: idx_pms_rooms_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pms_rooms_status ON public.pms_rooms USING btree (restaurant_id, status);


--
-- Name: idx_pos_order_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_order_items_order_id ON public.pos_order_items USING btree (order_id);


--
-- Name: idx_pos_orders_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_orders_customer_id ON public.pos_orders USING btree (customer_id) WHERE (customer_id IS NOT NULL);


--
-- Name: idx_pos_orders_receipt_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_pos_orders_receipt_unique ON public.pos_orders USING btree (restaurant_id, receipt_number) WHERE (receipt_number IS NOT NULL);


--
-- Name: idx_pos_orders_restaurant_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_orders_restaurant_created ON public.pos_orders USING btree (restaurant_id, created_at DESC);


--
-- Name: idx_pos_payments_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_payments_order_id ON public.pos_payments USING btree (order_id);


--
-- Name: idx_restaurant_addons_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_addons_restaurant_id ON public.restaurant_addons USING btree (restaurant_id);


--
-- Name: idx_restaurant_drivers_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_drivers_active ON public.restaurant_drivers USING btree (restaurant_id, is_active);


--
-- Name: idx_restaurant_drivers_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_drivers_restaurant_id ON public.restaurant_drivers USING btree (restaurant_id);


--
-- Name: idx_restaurant_drivers_unique_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_restaurant_drivers_unique_phone ON public.restaurant_drivers USING btree (restaurant_id, phone) WHERE (phone IS NOT NULL);


--
-- Name: idx_restaurant_employees_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_employees_restaurant_id ON public.restaurant_employees USING btree (restaurant_id);


--
-- Name: idx_restaurant_locations_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_locations_restaurant_id ON public.restaurant_locations USING btree (restaurant_id);


--
-- Name: idx_restaurant_ratings_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_ratings_restaurant_id ON public.restaurant_ratings USING btree (restaurant_id);


--
-- Name: idx_restaurant_stock_sync_api_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_stock_sync_api_key ON public.restaurant_stock_sync USING btree (inbound_api_key);


--
-- Name: idx_restaurant_stock_sync_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_stock_sync_restaurant_id ON public.restaurant_stock_sync USING btree (restaurant_id);


--
-- Name: idx_restaurant_subscriptions_next_due_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_subscriptions_next_due_at ON public.restaurant_subscriptions USING btree (next_due_at);


--
-- Name: idx_restaurant_subscriptions_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_subscriptions_restaurant_id ON public.restaurant_subscriptions USING btree (restaurant_id);


--
-- Name: idx_restaurant_subscriptions_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_subscriptions_status ON public.restaurant_subscriptions USING btree (status);


--
-- Name: idx_restaurants_delivers_nationwide; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurants_delivers_nationwide ON public.restaurants USING btree (delivers_nationwide) WHERE (delivers_nationwide = true);


--
-- Name: idx_restaurants_geo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurants_geo ON public.restaurants USING btree (latitude, longitude) WHERE ((latitude IS NOT NULL) AND (longitude IS NOT NULL));


--
-- Name: idx_retail_daily_closes_restaurant_closed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_retail_daily_closes_restaurant_closed_at ON public.retail_daily_closes USING btree (restaurant_id, closed_at DESC);


--
-- Name: idx_stock_sync_events_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stock_sync_events_restaurant_id ON public.stock_sync_events USING btree (restaurant_id, created_at DESC);


--
-- Name: idx_subscription_reminder_log_subscription_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscription_reminder_log_subscription_id ON public.subscription_reminder_log USING btree (subscription_id);


--
-- Name: idx_suppliers_restaurant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_suppliers_restaurant_id ON public.suppliers USING btree (restaurant_id);


--
-- Name: idx_table_reservations_crm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_table_reservations_crm ON public.table_reservations USING btree (crm_customer_id) WHERE (crm_customer_id IS NOT NULL);


--
-- Name: idx_table_reservations_restaurant_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_table_reservations_restaurant_date ON public.table_reservations USING btree (restaurant_id, reservation_date);


--
-- Name: idx_table_reservations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_table_reservations_status ON public.table_reservations USING btree (restaurant_id, status);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_08_04_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_08_04_inserted_at_topic_idx ON realtime.messages_2026_08_04 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_08_05_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_08_05_inserted_at_topic_idx ON realtime.messages_2026_08_05 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_08_06_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_08_06_inserted_at_topic_idx ON realtime.messages_2026_08_06 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_08_07_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_08_07_inserted_at_topic_idx ON realtime.messages_2026_08_07 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_08_08_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_08_08_inserted_at_topic_idx ON realtime.messages_2026_08_08 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_08_09_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_08_09_inserted_at_topic_idx ON realtime.messages_2026_08_09 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_08_10_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_08_10_inserted_at_topic_idx ON realtime.messages_2026_08_10 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_selec; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_selec ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter, COALESCE(selected_columns, '{}'::text[]));


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: messages_2026_08_04_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_08_04_inserted_at_topic_idx;


--
-- Name: messages_2026_08_04_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_08_04_pkey;


--
-- Name: messages_2026_08_05_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_08_05_inserted_at_topic_idx;


--
-- Name: messages_2026_08_05_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_08_05_pkey;


--
-- Name: messages_2026_08_06_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_08_06_inserted_at_topic_idx;


--
-- Name: messages_2026_08_06_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_08_06_pkey;


--
-- Name: messages_2026_08_07_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_08_07_inserted_at_topic_idx;


--
-- Name: messages_2026_08_07_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_08_07_pkey;


--
-- Name: messages_2026_08_08_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_08_08_inserted_at_topic_idx;


--
-- Name: messages_2026_08_08_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_08_08_pkey;


--
-- Name: messages_2026_08_09_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_08_09_inserted_at_topic_idx;


--
-- Name: messages_2026_08_09_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_08_09_pkey;


--
-- Name: messages_2026_08_10_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_08_10_inserted_at_topic_idx;


--
-- Name: messages_2026_08_10_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_08_10_pkey;


--
-- Name: orders orders_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.orders_set_updated_at();


--
-- Name: restaurant_drivers restaurant_drivers_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER restaurant_drivers_updated_at BEFORE UPDATE ON public.restaurant_drivers FOR EACH ROW EXECUTE FUNCTION public.restaurant_drivers_set_updated_at();


--
-- Name: restaurant_delivery_tiers trg_delivery_tiers_touch; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_delivery_tiers_touch BEFORE UPDATE ON public.restaurant_delivery_tiers FOR EACH ROW EXECUTE FUNCTION public.touch_delivery_tiers_updated_at();


--
-- Name: restaurant_fast_delivery_tiers trg_fast_delivery_tiers_touch; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_fast_delivery_tiers_touch BEFORE UPDATE ON public.restaurant_fast_delivery_tiers FOR EACH ROW EXECUTE FUNCTION public.touch_fast_delivery_tiers_updated_at();


--
-- Name: inventory_movements trg_inventory_movement_update_qty; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_inventory_movement_update_qty AFTER INSERT ON public.inventory_movements FOR EACH ROW EXECUTE FUNCTION public.update_inventory_qty();


--
-- Name: loyalty_members trg_member_tier_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_member_tier_update BEFORE UPDATE OF lifetime_points ON public.loyalty_members FOR EACH ROW EXECUTE FUNCTION public.recalculate_member_tier();


--
-- Name: pms_charges trg_pms_charges_sync; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_pms_charges_sync AFTER INSERT OR DELETE ON public.pms_charges FOR EACH ROW EXECUTE FUNCTION public.sync_pms_reservation_totals();


--
-- Name: restaurant_stock_sync trg_restaurant_stock_sync_touch; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_restaurant_stock_sync_touch BEFORE UPDATE ON public.restaurant_stock_sync FOR EACH ROW EXECUTE FUNCTION public.touch_restaurant_stock_sync_updated_at();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: accounting_expenses accounting_expenses_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounting_expenses
    ADD CONSTRAINT accounting_expenses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: accounting_expenses accounting_expenses_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounting_expenses
    ADD CONSTRAINT accounting_expenses_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: categories categories_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: club_check_ins club_check_ins_checked_in_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_check_ins
    ADD CONSTRAINT club_check_ins_checked_in_by_fkey FOREIGN KEY (checked_in_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: club_check_ins club_check_ins_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_check_ins
    ADD CONSTRAINT club_check_ins_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.club_members(id) ON DELETE CASCADE;


--
-- Name: club_check_ins club_check_ins_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_check_ins
    ADD CONSTRAINT club_check_ins_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: club_invoices club_invoices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_invoices
    ADD CONSTRAINT club_invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: club_invoices club_invoices_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_invoices
    ADD CONSTRAINT club_invoices_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.club_members(id) ON DELETE CASCADE;


--
-- Name: club_invoices club_invoices_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_invoices
    ADD CONSTRAINT club_invoices_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: club_members club_members_crm_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_members
    ADD CONSTRAINT club_members_crm_customer_id_fkey FOREIGN KEY (crm_customer_id) REFERENCES public.crm_customers(id) ON DELETE SET NULL;


--
-- Name: club_members club_members_loyalty_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_members
    ADD CONSTRAINT club_members_loyalty_member_id_fkey FOREIGN KEY (loyalty_member_id) REFERENCES public.loyalty_members(id) ON DELETE SET NULL;


--
-- Name: club_members club_members_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_members
    ADD CONSTRAINT club_members_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.club_plans(id) ON DELETE SET NULL;


--
-- Name: club_members club_members_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_members
    ADD CONSTRAINT club_members_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: club_plans club_plans_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.club_plans
    ADD CONSTRAINT club_plans_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: crm_customer_notes crm_customer_notes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_customer_notes
    ADD CONSTRAINT crm_customer_notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: crm_customer_notes crm_customer_notes_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_customer_notes
    ADD CONSTRAINT crm_customer_notes_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.crm_customers(id) ON DELETE CASCADE;


--
-- Name: crm_customer_notes crm_customer_notes_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_customer_notes
    ADD CONSTRAINT crm_customer_notes_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: crm_customer_tag_assignments crm_customer_tag_assignments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_customer_tag_assignments
    ADD CONSTRAINT crm_customer_tag_assignments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.crm_customers(id) ON DELETE CASCADE;


--
-- Name: crm_customer_tag_assignments crm_customer_tag_assignments_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_customer_tag_assignments
    ADD CONSTRAINT crm_customer_tag_assignments_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.crm_tags(id) ON DELETE CASCADE;


--
-- Name: crm_customers crm_customers_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_customers
    ADD CONSTRAINT crm_customers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: crm_tags crm_tags_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crm_tags
    ADD CONSTRAINT crm_tags_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: customer_addresses customer_addresses_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customer_profiles(id) ON DELETE CASCADE;


--
-- Name: customer_profiles customer_profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_profiles
    ADD CONSTRAINT customer_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: customer_signup_otps customer_signup_otps_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_signup_otps
    ADD CONSTRAINT customer_signup_otps_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ecommerce_delivery_zones ecommerce_delivery_zones_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecommerce_delivery_zones
    ADD CONSTRAINT ecommerce_delivery_zones_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: ecommerce_order_items ecommerce_order_items_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecommerce_order_items
    ADD CONSTRAINT ecommerce_order_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE SET NULL;


--
-- Name: ecommerce_order_items ecommerce_order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecommerce_order_items
    ADD CONSTRAINT ecommerce_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.ecommerce_orders(id) ON DELETE CASCADE;


--
-- Name: ecommerce_order_items ecommerce_order_items_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecommerce_order_items
    ADD CONSTRAINT ecommerce_order_items_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: ecommerce_orders ecommerce_orders_crm_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecommerce_orders
    ADD CONSTRAINT ecommerce_orders_crm_customer_id_fkey FOREIGN KEY (crm_customer_id) REFERENCES public.crm_customers(id) ON DELETE SET NULL;


--
-- Name: ecommerce_orders ecommerce_orders_delivery_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecommerce_orders
    ADD CONSTRAINT ecommerce_orders_delivery_zone_id_fkey FOREIGN KEY (delivery_zone_id) REFERENCES public.ecommerce_delivery_zones(id) ON DELETE SET NULL;


--
-- Name: ecommerce_orders ecommerce_orders_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecommerce_orders
    ADD CONSTRAINT ecommerce_orders_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: ecommerce_stores ecommerce_stores_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ecommerce_stores
    ADD CONSTRAINT ecommerce_stores_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: event_booking_packages event_booking_packages_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_booking_packages
    ADD CONSTRAINT event_booking_packages_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.event_bookings(id) ON DELETE CASCADE;


--
-- Name: event_booking_packages event_booking_packages_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_booking_packages
    ADD CONSTRAINT event_booking_packages_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.event_packages(id) ON DELETE SET NULL;


--
-- Name: event_bookings event_bookings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_bookings
    ADD CONSTRAINT event_bookings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: event_bookings event_bookings_crm_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_bookings
    ADD CONSTRAINT event_bookings_crm_customer_id_fkey FOREIGN KEY (crm_customer_id) REFERENCES public.crm_customers(id) ON DELETE SET NULL;


--
-- Name: event_bookings event_bookings_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_bookings
    ADD CONSTRAINT event_bookings_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: event_bookings event_bookings_space_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_bookings
    ADD CONSTRAINT event_bookings_space_id_fkey FOREIGN KEY (space_id) REFERENCES public.event_spaces(id) ON DELETE SET NULL;


--
-- Name: event_packages event_packages_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_packages
    ADD CONSTRAINT event_packages_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: event_spaces event_spaces_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_spaces
    ADD CONSTRAINT event_spaces_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: fleet_deliveries fleet_deliveries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleet_deliveries
    ADD CONSTRAINT fleet_deliveries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: fleet_deliveries fleet_deliveries_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleet_deliveries
    ADD CONSTRAINT fleet_deliveries_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.fleet_drivers(id) ON DELETE SET NULL;


--
-- Name: fleet_deliveries fleet_deliveries_ecommerce_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleet_deliveries
    ADD CONSTRAINT fleet_deliveries_ecommerce_order_id_fkey FOREIGN KEY (ecommerce_order_id) REFERENCES public.ecommerce_orders(id) ON DELETE SET NULL;


--
-- Name: fleet_deliveries fleet_deliveries_pos_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleet_deliveries
    ADD CONSTRAINT fleet_deliveries_pos_order_id_fkey FOREIGN KEY (pos_order_id) REFERENCES public.pos_orders(id) ON DELETE SET NULL;


--
-- Name: fleet_deliveries fleet_deliveries_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleet_deliveries
    ADD CONSTRAINT fleet_deliveries_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: fleet_deliveries fleet_deliveries_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleet_deliveries
    ADD CONSTRAINT fleet_deliveries_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.fleet_vehicles(id) ON DELETE SET NULL;


--
-- Name: fleet_drivers fleet_drivers_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleet_drivers
    ADD CONSTRAINT fleet_drivers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: fleet_drivers fleet_drivers_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleet_drivers
    ADD CONSTRAINT fleet_drivers_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.fleet_vehicles(id) ON DELETE SET NULL;


--
-- Name: fleet_vehicle_logs fleet_vehicle_logs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleet_vehicle_logs
    ADD CONSTRAINT fleet_vehicle_logs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: fleet_vehicle_logs fleet_vehicle_logs_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleet_vehicle_logs
    ADD CONSTRAINT fleet_vehicle_logs_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: fleet_vehicle_logs fleet_vehicle_logs_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleet_vehicle_logs
    ADD CONSTRAINT fleet_vehicle_logs_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.fleet_vehicles(id) ON DELETE CASCADE;


--
-- Name: fleet_vehicles fleet_vehicles_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fleet_vehicles
    ADD CONSTRAINT fleet_vehicles_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: gym_member_packages gym_member_packages_club_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_member_packages
    ADD CONSTRAINT gym_member_packages_club_member_id_fkey FOREIGN KEY (club_member_id) REFERENCES public.club_members(id) ON DELETE SET NULL;


--
-- Name: gym_member_packages gym_member_packages_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_member_packages
    ADD CONSTRAINT gym_member_packages_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: gym_member_packages gym_member_packages_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_member_packages
    ADD CONSTRAINT gym_member_packages_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.gym_pt_packages(id) ON DELETE RESTRICT;


--
-- Name: gym_member_packages gym_member_packages_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_member_packages
    ADD CONSTRAINT gym_member_packages_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: gym_pt_packages gym_pt_packages_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_pt_packages
    ADD CONSTRAINT gym_pt_packages_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: gym_pt_sessions gym_pt_sessions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_pt_sessions
    ADD CONSTRAINT gym_pt_sessions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: gym_pt_sessions gym_pt_sessions_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_pt_sessions
    ADD CONSTRAINT gym_pt_sessions_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.gym_pt_packages(id) ON DELETE SET NULL;


--
-- Name: gym_pt_sessions gym_pt_sessions_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_pt_sessions
    ADD CONSTRAINT gym_pt_sessions_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: gym_pt_sessions gym_pt_sessions_trainer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_pt_sessions
    ADD CONSTRAINT gym_pt_sessions_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES public.gym_trainers(id) ON DELETE RESTRICT;


--
-- Name: gym_trainer_payouts gym_trainer_payouts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_trainer_payouts
    ADD CONSTRAINT gym_trainer_payouts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: gym_trainer_payouts gym_trainer_payouts_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_trainer_payouts
    ADD CONSTRAINT gym_trainer_payouts_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: gym_trainer_payouts gym_trainer_payouts_trainer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_trainer_payouts
    ADD CONSTRAINT gym_trainer_payouts_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES public.gym_trainers(id) ON DELETE RESTRICT;


--
-- Name: gym_trainers gym_trainers_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gym_trainers
    ADD CONSTRAINT gym_trainers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: inventory_items inventory_items_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: inventory_items inventory_items_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


--
-- Name: inventory_movements inventory_movements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: inventory_movements inventory_movements_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE CASCADE;


--
-- Name: inventory_movements inventory_movements_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.restaurant_subscriptions(id) ON DELETE SET NULL;


--
-- Name: loyalty_members loyalty_members_crm_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_members
    ADD CONSTRAINT loyalty_members_crm_customer_id_fkey FOREIGN KEY (crm_customer_id) REFERENCES public.crm_customers(id) ON DELETE SET NULL;


--
-- Name: loyalty_members loyalty_members_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_members
    ADD CONSTRAINT loyalty_members_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: loyalty_programs loyalty_programs_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_programs
    ADD CONSTRAINT loyalty_programs_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: loyalty_transactions loyalty_transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: loyalty_transactions loyalty_transactions_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.loyalty_members(id) ON DELETE CASCADE;


--
-- Name: loyalty_transactions loyalty_transactions_pos_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_pos_order_id_fkey FOREIGN KEY (pos_order_id) REFERENCES public.pos_orders(id) ON DELETE SET NULL;


--
-- Name: loyalty_transactions loyalty_transactions_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: menu_brands menu_brands_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_brands
    ADD CONSTRAINT menu_brands_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: menu_coupon_codes menu_coupon_codes_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_coupon_codes
    ADD CONSTRAINT menu_coupon_codes_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: menu_items menu_items_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.menu_brands(id) ON DELETE SET NULL;


--
-- Name: menu_items menu_items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: menu_items menu_items_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: menu_promotions menu_promotions_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_promotions
    ADD CONSTRAINT menu_promotions_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: orders orders_coupon_code_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_coupon_code_id_fkey FOREIGN KEY (coupon_code_id) REFERENCES public.menu_coupon_codes(id) ON DELETE SET NULL;


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customer_profiles(id) ON DELETE SET NULL;


--
-- Name: orders orders_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.restaurant_drivers(id) ON DELETE SET NULL;


--
-- Name: orders orders_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: password_change_otps password_change_otps_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_change_otps
    ADD CONSTRAINT password_change_otps_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: payments payments_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: payments payments_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: payroll_entries payroll_entries_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_entries
    ADD CONSTRAINT payroll_entries_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.restaurant_employees(id) ON DELETE CASCADE;


--
-- Name: payroll_entries payroll_entries_payroll_run_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_entries
    ADD CONSTRAINT payroll_entries_payroll_run_id_fkey FOREIGN KEY (payroll_run_id) REFERENCES public.payroll_runs(id) ON DELETE CASCADE;


--
-- Name: payroll_entries payroll_entries_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_entries
    ADD CONSTRAINT payroll_entries_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: payroll_runs payroll_runs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: payroll_runs payroll_runs_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll_runs
    ADD CONSTRAINT payroll_runs_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: platform_ops_payment_reminder_log platform_ops_payment_reminder_log_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_ops_payment_reminder_log
    ADD CONSTRAINT platform_ops_payment_reminder_log_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.platform_ops_payments(id) ON DELETE CASCADE;


--
-- Name: pms_charges pms_charges_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_charges
    ADD CONSTRAINT pms_charges_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: pms_charges pms_charges_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_charges
    ADD CONSTRAINT pms_charges_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.pms_reservations(id) ON DELETE CASCADE;


--
-- Name: pms_charges pms_charges_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_charges
    ADD CONSTRAINT pms_charges_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: pms_housekeeping_logs pms_housekeeping_logs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_housekeeping_logs
    ADD CONSTRAINT pms_housekeeping_logs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: pms_housekeeping_logs pms_housekeeping_logs_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_housekeeping_logs
    ADD CONSTRAINT pms_housekeeping_logs_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: pms_housekeeping_logs pms_housekeeping_logs_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_housekeeping_logs
    ADD CONSTRAINT pms_housekeeping_logs_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.pms_rooms(id) ON DELETE CASCADE;


--
-- Name: pms_reservations pms_reservations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_reservations
    ADD CONSTRAINT pms_reservations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: pms_reservations pms_reservations_crm_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_reservations
    ADD CONSTRAINT pms_reservations_crm_customer_id_fkey FOREIGN KEY (crm_customer_id) REFERENCES public.crm_customers(id) ON DELETE SET NULL;


--
-- Name: pms_reservations pms_reservations_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_reservations
    ADD CONSTRAINT pms_reservations_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: pms_reservations pms_reservations_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_reservations
    ADD CONSTRAINT pms_reservations_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.pms_rooms(id) ON DELETE SET NULL;


--
-- Name: pms_reservations pms_reservations_room_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_reservations
    ADD CONSTRAINT pms_reservations_room_type_id_fkey FOREIGN KEY (room_type_id) REFERENCES public.pms_room_types(id) ON DELETE SET NULL;


--
-- Name: pms_room_types pms_room_types_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_room_types
    ADD CONSTRAINT pms_room_types_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: pms_rooms pms_rooms_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_rooms
    ADD CONSTRAINT pms_rooms_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: pms_rooms pms_rooms_room_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pms_rooms
    ADD CONSTRAINT pms_rooms_room_type_id_fkey FOREIGN KEY (room_type_id) REFERENCES public.pms_room_types(id) ON DELETE SET NULL;


--
-- Name: pos_order_items pos_order_items_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_order_items
    ADD CONSTRAINT pos_order_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE SET NULL;


--
-- Name: pos_order_items pos_order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_order_items
    ADD CONSTRAINT pos_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.pos_orders(id) ON DELETE CASCADE;


--
-- Name: pos_order_items pos_order_items_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_order_items
    ADD CONSTRAINT pos_order_items_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: pos_orders pos_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_orders
    ADD CONSTRAINT pos_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: pos_orders pos_orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_orders
    ADD CONSTRAINT pos_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.crm_customers(id) ON DELETE SET NULL;


--
-- Name: pos_orders pos_orders_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_orders
    ADD CONSTRAINT pos_orders_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: pos_orders pos_orders_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_orders
    ADD CONSTRAINT pos_orders_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.pos_sessions(id) ON DELETE SET NULL;


--
-- Name: pos_payments pos_payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_payments
    ADD CONSTRAINT pos_payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.pos_orders(id) ON DELETE CASCADE;


--
-- Name: pos_payments pos_payments_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_payments
    ADD CONSTRAINT pos_payments_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: pos_payments pos_payments_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_payments
    ADD CONSTRAINT pos_payments_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: pos_sessions pos_sessions_opened_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_sessions
    ADD CONSTRAINT pos_sessions_opened_by_fkey FOREIGN KEY (opened_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: pos_sessions pos_sessions_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_sessions
    ADD CONSTRAINT pos_sessions_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: restaurant_addons restaurant_addons_enabled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_addons
    ADD CONSTRAINT restaurant_addons_enabled_by_fkey FOREIGN KEY (enabled_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: restaurant_addons restaurant_addons_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_addons
    ADD CONSTRAINT restaurant_addons_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: restaurant_delivery_tiers restaurant_delivery_tiers_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_delivery_tiers
    ADD CONSTRAINT restaurant_delivery_tiers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: restaurant_drivers restaurant_drivers_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_drivers
    ADD CONSTRAINT restaurant_drivers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: restaurant_employees restaurant_employees_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_employees
    ADD CONSTRAINT restaurant_employees_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: restaurant_fast_delivery_tiers restaurant_fast_delivery_tiers_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_fast_delivery_tiers
    ADD CONSTRAINT restaurant_fast_delivery_tiers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: restaurant_locations restaurant_locations_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_locations
    ADD CONSTRAINT restaurant_locations_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: restaurant_ratings restaurant_ratings_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_ratings
    ADD CONSTRAINT restaurant_ratings_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: restaurant_stock_sync restaurant_stock_sync_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_stock_sync
    ADD CONSTRAINT restaurant_stock_sync_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: restaurant_subscriptions restaurant_subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_subscriptions
    ADD CONSTRAINT restaurant_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE SET NULL;


--
-- Name: restaurant_subscriptions restaurant_subscriptions_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_subscriptions
    ADD CONSTRAINT restaurant_subscriptions_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: retail_daily_closes retail_daily_closes_closed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.retail_daily_closes
    ADD CONSTRAINT retail_daily_closes_closed_by_fkey FOREIGN KEY (closed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: retail_daily_closes retail_daily_closes_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.retail_daily_closes
    ADD CONSTRAINT retail_daily_closes_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: stock_sync_events stock_sync_events_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_sync_events
    ADD CONSTRAINT stock_sync_events_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE SET NULL;


--
-- Name: stock_sync_events stock_sync_events_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_sync_events
    ADD CONSTRAINT stock_sync_events_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: subscription_reminder_log subscription_reminder_log_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_reminder_log
    ADD CONSTRAINT subscription_reminder_log_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.restaurant_subscriptions(id) ON DELETE CASCADE;


--
-- Name: suppliers suppliers_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: table_reservations table_reservations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_reservations
    ADD CONSTRAINT table_reservations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: table_reservations table_reservations_crm_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_reservations
    ADD CONSTRAINT table_reservations_crm_customer_id_fkey FOREIGN KEY (crm_customer_id) REFERENCES public.crm_customers(id) ON DELETE SET NULL;


--
-- Name: table_reservations table_reservations_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_reservations
    ADD CONSTRAINT table_reservations_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;


--
-- Name: users users_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: users users_restaurant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE SET NULL;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: accounting_expenses; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.accounting_expenses ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: club_check_ins; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.club_check_ins ENABLE ROW LEVEL SECURITY;

--
-- Name: club_invoices; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.club_invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: club_members; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

--
-- Name: club_plans; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.club_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_customer_notes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.crm_customer_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_customer_tag_assignments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.crm_customer_tag_assignments ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_customers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.crm_customers ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_tags; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.crm_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: customer_addresses; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

--
-- Name: customer_profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: customer_signup_otps; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.customer_signup_otps ENABLE ROW LEVEL SECURITY;

--
-- Name: customer_signup_otps customer_signup_otps_no_direct_access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY customer_signup_otps_no_direct_access ON public.customer_signup_otps USING (false) WITH CHECK (false);


--
-- Name: customer_profiles customers: delete own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "customers: delete own profile" ON public.customer_profiles FOR DELETE USING ((auth.uid() = id));


--
-- Name: customer_profiles customers: insert own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "customers: insert own profile" ON public.customer_profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: customer_addresses customers: manage own addresses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "customers: manage own addresses" ON public.customer_addresses USING ((auth.uid() = customer_id)) WITH CHECK ((auth.uid() = customer_id));


--
-- Name: orders customers: read own orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "customers: read own orders" ON public.orders FOR SELECT USING ((customer_id = auth.uid()));


--
-- Name: customer_profiles customers: read own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "customers: read own profile" ON public.customer_profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: customer_profiles customers: update own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "customers: update own profile" ON public.customer_profiles FOR UPDATE USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: ecommerce_delivery_zones; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ecommerce_delivery_zones ENABLE ROW LEVEL SECURITY;

--
-- Name: ecommerce_order_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ecommerce_order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: ecommerce_orders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ecommerce_orders ENABLE ROW LEVEL SECURITY;

--
-- Name: ecommerce_stores; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ecommerce_stores ENABLE ROW LEVEL SECURITY;

--
-- Name: event_booking_packages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.event_booking_packages ENABLE ROW LEVEL SECURITY;

--
-- Name: event_bookings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.event_bookings ENABLE ROW LEVEL SECURITY;

--
-- Name: event_packages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.event_packages ENABLE ROW LEVEL SECURITY;

--
-- Name: event_spaces; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.event_spaces ENABLE ROW LEVEL SECURITY;

--
-- Name: fleet_deliveries; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.fleet_deliveries ENABLE ROW LEVEL SECURITY;

--
-- Name: fleet_drivers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.fleet_drivers ENABLE ROW LEVEL SECURITY;

--
-- Name: fleet_vehicle_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.fleet_vehicle_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: fleet_vehicles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.fleet_vehicles ENABLE ROW LEVEL SECURITY;

--
-- Name: gym_member_packages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.gym_member_packages ENABLE ROW LEVEL SECURITY;

--
-- Name: gym_pt_packages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.gym_pt_packages ENABLE ROW LEVEL SECURITY;

--
-- Name: gym_pt_sessions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.gym_pt_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: gym_trainer_payouts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.gym_trainer_payouts ENABLE ROW LEVEL SECURITY;

--
-- Name: gym_trainers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.gym_trainers ENABLE ROW LEVEL SECURITY;

--
-- Name: inventory_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

--
-- Name: inventory_movements; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

--
-- Name: invoices; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: loyalty_members; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.loyalty_members ENABLE ROW LEVEL SECURITY;

--
-- Name: loyalty_programs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;

--
-- Name: loyalty_transactions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_brands; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.menu_brands ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_coupon_codes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.menu_coupon_codes ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_promotions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.menu_promotions ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: password_change_otps; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.password_change_otps ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: payroll_entries; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payroll_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: payroll_runs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_ops_payment_reminder_log; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.platform_ops_payment_reminder_log ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_ops_payments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.platform_ops_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: pms_charges; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.pms_charges ENABLE ROW LEVEL SECURITY;

--
-- Name: pms_housekeeping_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.pms_housekeeping_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: pms_reservations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.pms_reservations ENABLE ROW LEVEL SECURITY;

--
-- Name: pms_room_types; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.pms_room_types ENABLE ROW LEVEL SECURITY;

--
-- Name: pms_rooms; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.pms_rooms ENABLE ROW LEVEL SECURITY;

--
-- Name: pos_order_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.pos_order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: pos_orders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.pos_orders ENABLE ROW LEVEL SECURITY;

--
-- Name: pos_payments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.pos_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: pos_sessions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.pos_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: restaurants public can read active restaurants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "public can read active restaurants" ON public.restaurants FOR SELECT USING ((is_active = true));


--
-- Name: menu_items public can read available menu items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "public can read available menu items" ON public.menu_items FOR SELECT USING (((is_available = true) AND (EXISTS ( SELECT 1
   FROM public.restaurants r
  WHERE ((r.id = menu_items.restaurant_id) AND (r.is_active = true))))));


--
-- Name: menu_brands public can read brands for active restaurants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "public can read brands for active restaurants" ON public.menu_brands FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.restaurants r
  WHERE ((r.id = menu_brands.restaurant_id) AND (r.is_active = true)))));


--
-- Name: categories public can read categories for active restaurants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "public can read categories for active restaurants" ON public.categories FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.restaurants r
  WHERE ((r.id = categories.restaurant_id) AND (r.is_active = true)))));


--
-- Name: menu_promotions public can read promotions for active restaurants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "public can read promotions for active restaurants" ON public.menu_promotions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.restaurants r
  WHERE ((r.id = menu_promotions.restaurant_id) AND (r.is_active = true)))));


--
-- Name: restaurant_delivery_tiers public read delivery_tiers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "public read delivery_tiers" ON public.restaurant_delivery_tiers FOR SELECT TO authenticated, anon USING (true);


--
-- Name: restaurant_fast_delivery_tiers public read fast_delivery_tiers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "public read fast_delivery_tiers" ON public.restaurant_fast_delivery_tiers FOR SELECT TO authenticated, anon USING (true);


--
-- Name: restaurant_ratings public read restaurant ratings for active restaurants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "public read restaurant ratings for active restaurants" ON public.restaurant_ratings FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.restaurants x
  WHERE ((x.id = restaurant_ratings.restaurant_id) AND (x.is_active = true)))));


--
-- Name: orders public: insert orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "public: insert orders" ON public.orders FOR INSERT WITH CHECK (true);


--
-- Name: restaurant_locations public: read restaurant_locations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "public: read restaurant_locations" ON public.restaurant_locations FOR SELECT USING (true);


--
-- Name: inventory_movements restaurant admin insert own inventory_movements; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin insert own inventory_movements" ON public.inventory_movements FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = inventory_movements.restaurant_id)))));


--
-- Name: accounting_expenses restaurant admin manage own accounting_expenses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own accounting_expenses" ON public.accounting_expenses TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = accounting_expenses.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = accounting_expenses.restaurant_id)))));


--
-- Name: categories restaurant admin manage own categories; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own categories" ON public.categories TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = categories.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = categories.restaurant_id)))));


--
-- Name: menu_coupon_codes restaurant admin manage own coupon codes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own coupon codes" ON public.menu_coupon_codes TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = menu_coupon_codes.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = menu_coupon_codes.restaurant_id)))));


--
-- Name: crm_customer_notes restaurant admin manage own crm_customer_notes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own crm_customer_notes" ON public.crm_customer_notes TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = crm_customer_notes.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = crm_customer_notes.restaurant_id)))));


--
-- Name: crm_customer_tag_assignments restaurant admin manage own crm_customer_tag_assignments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own crm_customer_tag_assignments" ON public.crm_customer_tag_assignments TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.crm_customers c
     JOIN public.users u ON ((u.id = auth.uid())))
  WHERE ((c.id = crm_customer_tag_assignments.customer_id) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = c.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.crm_customers c
     JOIN public.users u ON ((u.id = auth.uid())))
  WHERE ((c.id = crm_customer_tag_assignments.customer_id) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = c.restaurant_id)))));


--
-- Name: crm_customers restaurant admin manage own crm_customers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own crm_customers" ON public.crm_customers TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = crm_customers.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = crm_customers.restaurant_id)))));


--
-- Name: crm_tags restaurant admin manage own crm_tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own crm_tags" ON public.crm_tags TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = crm_tags.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = crm_tags.restaurant_id)))));


--
-- Name: restaurant_delivery_tiers restaurant admin manage own delivery_tiers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own delivery_tiers" ON public.restaurant_delivery_tiers TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = restaurant_delivery_tiers.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = restaurant_delivery_tiers.restaurant_id)))));


--
-- Name: event_booking_packages restaurant admin manage own event_booking_packages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own event_booking_packages" ON public.event_booking_packages TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.event_bookings eb
     JOIN public.users u ON ((u.id = auth.uid())))
  WHERE ((eb.id = event_booking_packages.booking_id) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = eb.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.event_bookings eb
     JOIN public.users u ON ((u.id = auth.uid())))
  WHERE ((eb.id = event_booking_packages.booking_id) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = eb.restaurant_id)))));


--
-- Name: event_bookings restaurant admin manage own event_bookings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own event_bookings" ON public.event_bookings TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = event_bookings.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = event_bookings.restaurant_id)))));


--
-- Name: event_packages restaurant admin manage own event_packages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own event_packages" ON public.event_packages TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = event_packages.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = event_packages.restaurant_id)))));


--
-- Name: event_spaces restaurant admin manage own event_spaces; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own event_spaces" ON public.event_spaces TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = event_spaces.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = event_spaces.restaurant_id)))));


--
-- Name: restaurant_fast_delivery_tiers restaurant admin manage own fast_delivery_tiers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own fast_delivery_tiers" ON public.restaurant_fast_delivery_tiers TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = restaurant_fast_delivery_tiers.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = restaurant_fast_delivery_tiers.restaurant_id)))));


--
-- Name: inventory_items restaurant admin manage own inventory_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own inventory_items" ON public.inventory_items TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = inventory_items.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = inventory_items.restaurant_id)))));


--
-- Name: loyalty_members restaurant admin manage own loyalty_members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own loyalty_members" ON public.loyalty_members TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = loyalty_members.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = loyalty_members.restaurant_id)))));


--
-- Name: loyalty_programs restaurant admin manage own loyalty_programs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own loyalty_programs" ON public.loyalty_programs TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = loyalty_programs.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = loyalty_programs.restaurant_id)))));


--
-- Name: loyalty_transactions restaurant admin manage own loyalty_transactions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own loyalty_transactions" ON public.loyalty_transactions TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = loyalty_transactions.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = loyalty_transactions.restaurant_id)))));


--
-- Name: menu_brands restaurant admin manage own menu brands; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own menu brands" ON public.menu_brands TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = menu_brands.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = menu_brands.restaurant_id)))));


--
-- Name: menu_items restaurant admin manage own menu items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own menu items" ON public.menu_items TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = menu_items.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = menu_items.restaurant_id)))));


--
-- Name: menu_promotions restaurant admin manage own menu promotions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own menu promotions" ON public.menu_promotions TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = menu_promotions.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = menu_promotions.restaurant_id)))));


--
-- Name: payroll_entries restaurant admin manage own payroll_entries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own payroll_entries" ON public.payroll_entries TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = payroll_entries.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = payroll_entries.restaurant_id)))));


--
-- Name: payroll_runs restaurant admin manage own payroll_runs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own payroll_runs" ON public.payroll_runs TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = payroll_runs.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = payroll_runs.restaurant_id)))));


--
-- Name: pms_charges restaurant admin manage own pms_charges; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own pms_charges" ON public.pms_charges TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = pms_charges.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = pms_charges.restaurant_id)))));


--
-- Name: pms_housekeeping_logs restaurant admin manage own pms_housekeeping_logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own pms_housekeeping_logs" ON public.pms_housekeeping_logs TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = pms_housekeeping_logs.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = pms_housekeeping_logs.restaurant_id)))));


--
-- Name: pms_reservations restaurant admin manage own pms_reservations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own pms_reservations" ON public.pms_reservations TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = pms_reservations.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = pms_reservations.restaurant_id)))));


--
-- Name: pms_room_types restaurant admin manage own pms_room_types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own pms_room_types" ON public.pms_room_types TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = pms_room_types.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = pms_room_types.restaurant_id)))));


--
-- Name: pms_rooms restaurant admin manage own pms_rooms; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own pms_rooms" ON public.pms_rooms TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = pms_rooms.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = pms_rooms.restaurant_id)))));


--
-- Name: pos_order_items restaurant admin manage own pos_order_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own pos_order_items" ON public.pos_order_items TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = pos_order_items.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = pos_order_items.restaurant_id)))));


--
-- Name: pos_orders restaurant admin manage own pos_orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own pos_orders" ON public.pos_orders TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = pos_orders.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = pos_orders.restaurant_id)))));


--
-- Name: pos_payments restaurant admin manage own pos_payments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own pos_payments" ON public.pos_payments TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = pos_payments.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = pos_payments.restaurant_id)))));


--
-- Name: pos_sessions restaurant admin manage own pos_sessions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own pos_sessions" ON public.pos_sessions TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = pos_sessions.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = pos_sessions.restaurant_id)))));


--
-- Name: restaurant_employees restaurant admin manage own restaurant_employees; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own restaurant_employees" ON public.restaurant_employees TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = restaurant_employees.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = restaurant_employees.restaurant_id)))));


--
-- Name: retail_daily_closes restaurant admin manage own retail_daily_closes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own retail_daily_closes" ON public.retail_daily_closes TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = retail_daily_closes.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = retail_daily_closes.restaurant_id)))));


--
-- Name: restaurant_stock_sync restaurant admin manage own stock_sync; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own stock_sync" ON public.restaurant_stock_sync TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = restaurant_stock_sync.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = restaurant_stock_sync.restaurant_id)))));


--
-- Name: suppliers restaurant admin manage own suppliers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own suppliers" ON public.suppliers TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = suppliers.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = suppliers.restaurant_id)))));


--
-- Name: table_reservations restaurant admin manage own table_reservations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin manage own table_reservations" ON public.table_reservations TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = table_reservations.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = table_reservations.restaurant_id)))));


--
-- Name: club_check_ins restaurant admin own club_check_ins; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin own club_check_ins" ON public.club_check_ins TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = club_check_ins.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = club_check_ins.restaurant_id)))));


--
-- Name: club_invoices restaurant admin own club_invoices; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin own club_invoices" ON public.club_invoices TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = club_invoices.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = club_invoices.restaurant_id)))));


--
-- Name: club_members restaurant admin own club_members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin own club_members" ON public.club_members TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = club_members.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = club_members.restaurant_id)))));


--
-- Name: club_plans restaurant admin own club_plans; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin own club_plans" ON public.club_plans TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = club_plans.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = club_plans.restaurant_id)))));


--
-- Name: ecommerce_delivery_zones restaurant admin own ecommerce_delivery_zones; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin own ecommerce_delivery_zones" ON public.ecommerce_delivery_zones TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = ecommerce_delivery_zones.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = ecommerce_delivery_zones.restaurant_id)))));


--
-- Name: ecommerce_order_items restaurant admin own ecommerce_order_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin own ecommerce_order_items" ON public.ecommerce_order_items TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = ecommerce_order_items.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = ecommerce_order_items.restaurant_id)))));


--
-- Name: ecommerce_orders restaurant admin own ecommerce_orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin own ecommerce_orders" ON public.ecommerce_orders TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = ecommerce_orders.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = ecommerce_orders.restaurant_id)))));


--
-- Name: ecommerce_stores restaurant admin own ecommerce_stores; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin own ecommerce_stores" ON public.ecommerce_stores TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = ecommerce_stores.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = ecommerce_stores.restaurant_id)))));


--
-- Name: fleet_deliveries restaurant admin own fleet_deliveries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin own fleet_deliveries" ON public.fleet_deliveries TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = fleet_deliveries.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = fleet_deliveries.restaurant_id)))));


--
-- Name: fleet_drivers restaurant admin own fleet_drivers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin own fleet_drivers" ON public.fleet_drivers TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = fleet_drivers.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = fleet_drivers.restaurant_id)))));


--
-- Name: fleet_vehicle_logs restaurant admin own fleet_vehicle_logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin own fleet_vehicle_logs" ON public.fleet_vehicle_logs TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = fleet_vehicle_logs.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = fleet_vehicle_logs.restaurant_id)))));


--
-- Name: fleet_vehicles restaurant admin own fleet_vehicles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin own fleet_vehicles" ON public.fleet_vehicles TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = fleet_vehicles.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = fleet_vehicles.restaurant_id)))));


--
-- Name: gym_member_packages restaurant admin own gym_member_packages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin own gym_member_packages" ON public.gym_member_packages TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = gym_member_packages.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = gym_member_packages.restaurant_id)))));


--
-- Name: gym_pt_packages restaurant admin own gym_pt_packages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin own gym_pt_packages" ON public.gym_pt_packages TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = gym_pt_packages.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = gym_pt_packages.restaurant_id)))));


--
-- Name: gym_pt_sessions restaurant admin own gym_pt_sessions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin own gym_pt_sessions" ON public.gym_pt_sessions TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = gym_pt_sessions.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = gym_pt_sessions.restaurant_id)))));


--
-- Name: gym_trainer_payouts restaurant admin own gym_trainer_payouts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin own gym_trainer_payouts" ON public.gym_trainer_payouts TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = gym_trainer_payouts.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = gym_trainer_payouts.restaurant_id)))));


--
-- Name: gym_trainers restaurant admin own gym_trainers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin own gym_trainers" ON public.gym_trainers TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = gym_trainers.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = gym_trainers.restaurant_id)))));


--
-- Name: restaurant_addons restaurant admin read own addons; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin read own addons" ON public.restaurant_addons FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = restaurant_addons.restaurant_id)))));


--
-- Name: invoices restaurant admin read own invoices; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin read own invoices" ON public.invoices FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = invoices.restaurant_id)))));


--
-- Name: payments restaurant admin read own payments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin read own payments" ON public.payments FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = payments.restaurant_id)))));


--
-- Name: stock_sync_events restaurant admin read own stock_sync_events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin read own stock_sync_events" ON public.stock_sync_events FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = stock_sync_events.restaurant_id)))));


--
-- Name: restaurant_subscriptions restaurant admin read own subscriptions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin read own subscriptions" ON public.restaurant_subscriptions FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = restaurant_subscriptions.restaurant_id)))));


--
-- Name: inventory_movements restaurant admin select own inventory_movements; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin select own inventory_movements" ON public.inventory_movements FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = inventory_movements.restaurant_id)))));


--
-- Name: restaurants restaurant admin update own restaurant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant admin update own restaurant" ON public.restaurants FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = restaurants.id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'restaurant_admin'::text) AND (u.restaurant_id = restaurants.id)))));


--
-- Name: restaurant_drivers restaurant: manage own drivers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant: manage own drivers" ON public.restaurant_drivers USING ((restaurant_id IN ( SELECT users.restaurant_id
   FROM public.users
  WHERE (users.id = auth.uid())))) WITH CHECK ((restaurant_id IN ( SELECT users.restaurant_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: orders restaurant: manage own orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant: manage own orders" ON public.orders USING ((restaurant_id IN ( SELECT users.restaurant_id
   FROM public.users
  WHERE (users.id = auth.uid())))) WITH CHECK ((restaurant_id IN ( SELECT users.restaurant_id
   FROM public.users
  WHERE (users.id = auth.uid()))));


--
-- Name: restaurant_addons; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.restaurant_addons ENABLE ROW LEVEL SECURITY;

--
-- Name: restaurant_locations restaurant_admin: manage own restaurant_locations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "restaurant_admin: manage own restaurant_locations" ON public.restaurant_locations USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'restaurant_admin'::text) AND (users.restaurant_id = restaurant_locations.restaurant_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'restaurant_admin'::text) AND (users.restaurant_id = restaurant_locations.restaurant_id)))));


--
-- Name: restaurant_delivery_tiers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.restaurant_delivery_tiers ENABLE ROW LEVEL SECURITY;

--
-- Name: restaurant_drivers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.restaurant_drivers ENABLE ROW LEVEL SECURITY;

--
-- Name: restaurant_employees; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.restaurant_employees ENABLE ROW LEVEL SECURITY;

--
-- Name: restaurant_fast_delivery_tiers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.restaurant_fast_delivery_tiers ENABLE ROW LEVEL SECURITY;

--
-- Name: restaurant_locations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.restaurant_locations ENABLE ROW LEVEL SECURITY;

--
-- Name: restaurant_ratings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.restaurant_ratings ENABLE ROW LEVEL SECURITY;

--
-- Name: restaurant_stock_sync; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.restaurant_stock_sync ENABLE ROW LEVEL SECURITY;

--
-- Name: restaurant_subscriptions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.restaurant_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: restaurants; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

--
-- Name: retail_daily_closes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.retail_daily_closes ENABLE ROW LEVEL SECURITY;

--
-- Name: stock_sync_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.stock_sync_events ENABLE ROW LEVEL SECURITY;

--
-- Name: subscription_plans; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: subscription_reminder_log; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.subscription_reminder_log ENABLE ROW LEVEL SECURITY;

--
-- Name: accounting_expenses super admin full accounting_expenses access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full accounting_expenses access" ON public.accounting_expenses TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: crm_customer_notes super admin full crm_customer_notes access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full crm_customer_notes access" ON public.crm_customer_notes TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: crm_customer_tag_assignments super admin full crm_customer_tag_assignments access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full crm_customer_tag_assignments access" ON public.crm_customer_tag_assignments TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: crm_customers super admin full crm_customers access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full crm_customers access" ON public.crm_customers TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: crm_tags super admin full crm_tags access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full crm_tags access" ON public.crm_tags TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: restaurant_delivery_tiers super admin full delivery_tiers access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full delivery_tiers access" ON public.restaurant_delivery_tiers TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: restaurant_fast_delivery_tiers super admin full fast_delivery_tiers access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full fast_delivery_tiers access" ON public.restaurant_fast_delivery_tiers TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: gym_member_packages super admin full gym_member_packages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full gym_member_packages" ON public.gym_member_packages TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: gym_pt_packages super admin full gym_pt_packages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full gym_pt_packages" ON public.gym_pt_packages TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: gym_pt_sessions super admin full gym_pt_sessions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full gym_pt_sessions" ON public.gym_pt_sessions TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: gym_trainer_payouts super admin full gym_trainer_payouts; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full gym_trainer_payouts" ON public.gym_trainer_payouts TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: gym_trainers super admin full gym_trainers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full gym_trainers" ON public.gym_trainers TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: inventory_items super admin full inventory_items access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full inventory_items access" ON public.inventory_items TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: inventory_movements super admin full inventory_movements access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full inventory_movements access" ON public.inventory_movements TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: invoices super admin full invoices access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full invoices access" ON public.invoices TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: payments super admin full payments access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full payments access" ON public.payments TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: payroll_entries super admin full payroll_entries access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full payroll_entries access" ON public.payroll_entries TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: payroll_runs super admin full payroll_runs access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full payroll_runs access" ON public.payroll_runs TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: subscription_plans super admin full plans access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full plans access" ON public.subscription_plans TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: pos_order_items super admin full pos_order_items access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full pos_order_items access" ON public.pos_order_items TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: pos_orders super admin full pos_orders access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full pos_orders access" ON public.pos_orders TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: pos_payments super admin full pos_payments access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full pos_payments access" ON public.pos_payments TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: pos_sessions super admin full pos_sessions access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full pos_sessions access" ON public.pos_sessions TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: restaurant_addons super admin full restaurant_addons access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full restaurant_addons access" ON public.restaurant_addons TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: restaurant_employees super admin full restaurant_employees access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full restaurant_employees access" ON public.restaurant_employees TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: restaurant_stock_sync super admin full restaurant_stock_sync access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full restaurant_stock_sync access" ON public.restaurant_stock_sync TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: restaurants super admin full restaurants access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full restaurants access" ON public.restaurants TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: stock_sync_events super admin full stock_sync_events access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full stock_sync_events access" ON public.stock_sync_events FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: restaurant_subscriptions super admin full subscriptions access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full subscriptions access" ON public.restaurant_subscriptions TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: suppliers super admin full suppliers access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "super admin full suppliers access" ON public.suppliers TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: club_check_ins superadmin full club_check_ins; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full club_check_ins" ON public.club_check_ins TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: club_invoices superadmin full club_invoices; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full club_invoices" ON public.club_invoices TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: club_members superadmin full club_members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full club_members" ON public.club_members TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: club_plans superadmin full club_plans; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full club_plans" ON public.club_plans TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: ecommerce_delivery_zones superadmin full ecommerce_delivery_zones; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full ecommerce_delivery_zones" ON public.ecommerce_delivery_zones TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: ecommerce_order_items superadmin full ecommerce_order_items; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full ecommerce_order_items" ON public.ecommerce_order_items TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: ecommerce_orders superadmin full ecommerce_orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full ecommerce_orders" ON public.ecommerce_orders TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: ecommerce_stores superadmin full ecommerce_stores; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full ecommerce_stores" ON public.ecommerce_stores TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: event_booking_packages superadmin full event_booking_packages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full event_booking_packages" ON public.event_booking_packages TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: event_bookings superadmin full event_bookings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full event_bookings" ON public.event_bookings TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: event_packages superadmin full event_packages; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full event_packages" ON public.event_packages TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: event_spaces superadmin full event_spaces; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full event_spaces" ON public.event_spaces TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: fleet_deliveries superadmin full fleet_deliveries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full fleet_deliveries" ON public.fleet_deliveries TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: fleet_drivers superadmin full fleet_drivers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full fleet_drivers" ON public.fleet_drivers TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: fleet_vehicle_logs superadmin full fleet_vehicle_logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full fleet_vehicle_logs" ON public.fleet_vehicle_logs TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: fleet_vehicles superadmin full fleet_vehicles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full fleet_vehicles" ON public.fleet_vehicles TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: loyalty_members superadmin full loyalty_members access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full loyalty_members access" ON public.loyalty_members TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: loyalty_programs superadmin full loyalty_programs access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full loyalty_programs access" ON public.loyalty_programs TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: loyalty_transactions superadmin full loyalty_transactions access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full loyalty_transactions access" ON public.loyalty_transactions TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: pms_charges superadmin full pms_charges access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full pms_charges access" ON public.pms_charges TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: pms_housekeeping_logs superadmin full pms_housekeeping_logs access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full pms_housekeeping_logs access" ON public.pms_housekeeping_logs TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: pms_reservations superadmin full pms_reservations access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full pms_reservations access" ON public.pms_reservations TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: pms_room_types superadmin full pms_room_types access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full pms_room_types access" ON public.pms_room_types TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: pms_rooms superadmin full pms_rooms access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full pms_rooms access" ON public.pms_rooms TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: retail_daily_closes superadmin full retail_daily_closes access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full retail_daily_closes access" ON public.retail_daily_closes TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: table_reservations superadmin full table_reservations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin full table_reservations" ON public.table_reservations TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'superadmin'::text)))));


--
-- Name: restaurant_drivers superadmin: all drivers; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin: all drivers" ON public.restaurant_drivers USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'superadmin'::text)))));


--
-- Name: orders superadmin: all orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin: all orders" ON public.orders USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'superadmin'::text)))));


--
-- Name: restaurant_locations superadmin: manage all restaurant_locations; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "superadmin: manage all restaurant_locations" ON public.restaurant_locations USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'superadmin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'superadmin'::text)))));


--
-- Name: suppliers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

--
-- Name: table_reservations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.table_reservations ENABLE ROW LEVEL SECURITY;

--
-- Name: users user can read own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user can read own profile" ON public.users FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: password_change_otps users can manage own password otps; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "users can manage own password otps" ON public.password_change_otps TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: supabase_admin
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime_messages_publication OWNER TO supabase_admin;

--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: supabase_admin
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION gbtreekey16_in(cstring); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbtreekey16_in(cstring) TO postgres;
GRANT ALL ON FUNCTION public.gbtreekey16_in(cstring) TO anon;
GRANT ALL ON FUNCTION public.gbtreekey16_in(cstring) TO authenticated;
GRANT ALL ON FUNCTION public.gbtreekey16_in(cstring) TO service_role;


--
-- Name: FUNCTION gbtreekey16_out(public.gbtreekey16); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbtreekey16_out(public.gbtreekey16) TO postgres;
GRANT ALL ON FUNCTION public.gbtreekey16_out(public.gbtreekey16) TO anon;
GRANT ALL ON FUNCTION public.gbtreekey16_out(public.gbtreekey16) TO authenticated;
GRANT ALL ON FUNCTION public.gbtreekey16_out(public.gbtreekey16) TO service_role;


--
-- Name: FUNCTION gbtreekey2_in(cstring); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbtreekey2_in(cstring) TO postgres;
GRANT ALL ON FUNCTION public.gbtreekey2_in(cstring) TO anon;
GRANT ALL ON FUNCTION public.gbtreekey2_in(cstring) TO authenticated;
GRANT ALL ON FUNCTION public.gbtreekey2_in(cstring) TO service_role;


--
-- Name: FUNCTION gbtreekey2_out(public.gbtreekey2); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbtreekey2_out(public.gbtreekey2) TO postgres;
GRANT ALL ON FUNCTION public.gbtreekey2_out(public.gbtreekey2) TO anon;
GRANT ALL ON FUNCTION public.gbtreekey2_out(public.gbtreekey2) TO authenticated;
GRANT ALL ON FUNCTION public.gbtreekey2_out(public.gbtreekey2) TO service_role;


--
-- Name: FUNCTION gbtreekey32_in(cstring); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbtreekey32_in(cstring) TO postgres;
GRANT ALL ON FUNCTION public.gbtreekey32_in(cstring) TO anon;
GRANT ALL ON FUNCTION public.gbtreekey32_in(cstring) TO authenticated;
GRANT ALL ON FUNCTION public.gbtreekey32_in(cstring) TO service_role;


--
-- Name: FUNCTION gbtreekey32_out(public.gbtreekey32); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbtreekey32_out(public.gbtreekey32) TO postgres;
GRANT ALL ON FUNCTION public.gbtreekey32_out(public.gbtreekey32) TO anon;
GRANT ALL ON FUNCTION public.gbtreekey32_out(public.gbtreekey32) TO authenticated;
GRANT ALL ON FUNCTION public.gbtreekey32_out(public.gbtreekey32) TO service_role;


--
-- Name: FUNCTION gbtreekey4_in(cstring); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbtreekey4_in(cstring) TO postgres;
GRANT ALL ON FUNCTION public.gbtreekey4_in(cstring) TO anon;
GRANT ALL ON FUNCTION public.gbtreekey4_in(cstring) TO authenticated;
GRANT ALL ON FUNCTION public.gbtreekey4_in(cstring) TO service_role;


--
-- Name: FUNCTION gbtreekey4_out(public.gbtreekey4); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbtreekey4_out(public.gbtreekey4) TO postgres;
GRANT ALL ON FUNCTION public.gbtreekey4_out(public.gbtreekey4) TO anon;
GRANT ALL ON FUNCTION public.gbtreekey4_out(public.gbtreekey4) TO authenticated;
GRANT ALL ON FUNCTION public.gbtreekey4_out(public.gbtreekey4) TO service_role;


--
-- Name: FUNCTION gbtreekey8_in(cstring); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbtreekey8_in(cstring) TO postgres;
GRANT ALL ON FUNCTION public.gbtreekey8_in(cstring) TO anon;
GRANT ALL ON FUNCTION public.gbtreekey8_in(cstring) TO authenticated;
GRANT ALL ON FUNCTION public.gbtreekey8_in(cstring) TO service_role;


--
-- Name: FUNCTION gbtreekey8_out(public.gbtreekey8); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbtreekey8_out(public.gbtreekey8) TO postgres;
GRANT ALL ON FUNCTION public.gbtreekey8_out(public.gbtreekey8) TO anon;
GRANT ALL ON FUNCTION public.gbtreekey8_out(public.gbtreekey8) TO authenticated;
GRANT ALL ON FUNCTION public.gbtreekey8_out(public.gbtreekey8) TO service_role;


--
-- Name: FUNCTION gbtreekey_var_in(cstring); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbtreekey_var_in(cstring) TO postgres;
GRANT ALL ON FUNCTION public.gbtreekey_var_in(cstring) TO anon;
GRANT ALL ON FUNCTION public.gbtreekey_var_in(cstring) TO authenticated;
GRANT ALL ON FUNCTION public.gbtreekey_var_in(cstring) TO service_role;


--
-- Name: FUNCTION gbtreekey_var_out(public.gbtreekey_var); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbtreekey_var_out(public.gbtreekey_var) TO postgres;
GRANT ALL ON FUNCTION public.gbtreekey_var_out(public.gbtreekey_var) TO anon;
GRANT ALL ON FUNCTION public.gbtreekey_var_out(public.gbtreekey_var) TO authenticated;
GRANT ALL ON FUNCTION public.gbtreekey_var_out(public.gbtreekey_var) TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;


--
-- Name: FUNCTION calculate_delivery_fee(p_restaurant_id uuid, p_distance_km numeric); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calculate_delivery_fee(p_restaurant_id uuid, p_distance_km numeric) TO anon;
GRANT ALL ON FUNCTION public.calculate_delivery_fee(p_restaurant_id uuid, p_distance_km numeric) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_delivery_fee(p_restaurant_id uuid, p_distance_km numeric) TO service_role;


--
-- Name: FUNCTION calculate_fast_delivery_fee(p_restaurant_id uuid, p_distance_km numeric); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calculate_fast_delivery_fee(p_restaurant_id uuid, p_distance_km numeric) TO anon;
GRANT ALL ON FUNCTION public.calculate_fast_delivery_fee(p_restaurant_id uuid, p_distance_km numeric) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_fast_delivery_fee(p_restaurant_id uuid, p_distance_km numeric) TO service_role;


--
-- Name: FUNCTION cash_dist(money, money); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.cash_dist(money, money) TO postgres;
GRANT ALL ON FUNCTION public.cash_dist(money, money) TO anon;
GRANT ALL ON FUNCTION public.cash_dist(money, money) TO authenticated;
GRANT ALL ON FUNCTION public.cash_dist(money, money) TO service_role;


--
-- Name: FUNCTION date_dist(date, date); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.date_dist(date, date) TO postgres;
GRANT ALL ON FUNCTION public.date_dist(date, date) TO anon;
GRANT ALL ON FUNCTION public.date_dist(date, date) TO authenticated;
GRANT ALL ON FUNCTION public.date_dist(date, date) TO service_role;


--
-- Name: FUNCTION float4_dist(real, real); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.float4_dist(real, real) TO postgres;
GRANT ALL ON FUNCTION public.float4_dist(real, real) TO anon;
GRANT ALL ON FUNCTION public.float4_dist(real, real) TO authenticated;
GRANT ALL ON FUNCTION public.float4_dist(real, real) TO service_role;


--
-- Name: FUNCTION float8_dist(double precision, double precision); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.float8_dist(double precision, double precision) TO postgres;
GRANT ALL ON FUNCTION public.float8_dist(double precision, double precision) TO anon;
GRANT ALL ON FUNCTION public.float8_dist(double precision, double precision) TO authenticated;
GRANT ALL ON FUNCTION public.float8_dist(double precision, double precision) TO service_role;


--
-- Name: FUNCTION gbt_bit_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bit_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bit_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bit_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bit_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_bit_consistent(internal, bit, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bit_consistent(internal, bit, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bit_consistent(internal, bit, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bit_consistent(internal, bit, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bit_consistent(internal, bit, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_bit_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bit_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bit_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bit_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bit_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_bit_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bit_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bit_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bit_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bit_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_bit_same(public.gbtreekey_var, public.gbtreekey_var, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bit_same(public.gbtreekey_var, public.gbtreekey_var, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bit_same(public.gbtreekey_var, public.gbtreekey_var, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bit_same(public.gbtreekey_var, public.gbtreekey_var, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bit_same(public.gbtreekey_var, public.gbtreekey_var, internal) TO service_role;


--
-- Name: FUNCTION gbt_bit_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bit_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bit_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bit_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bit_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_bool_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bool_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bool_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bool_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bool_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_bool_consistent(internal, boolean, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bool_consistent(internal, boolean, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bool_consistent(internal, boolean, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bool_consistent(internal, boolean, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bool_consistent(internal, boolean, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_bool_fetch(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bool_fetch(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bool_fetch(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bool_fetch(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bool_fetch(internal) TO service_role;


--
-- Name: FUNCTION gbt_bool_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bool_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bool_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bool_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bool_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_bool_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bool_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bool_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bool_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bool_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_bool_same(public.gbtreekey2, public.gbtreekey2, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bool_same(public.gbtreekey2, public.gbtreekey2, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bool_same(public.gbtreekey2, public.gbtreekey2, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bool_same(public.gbtreekey2, public.gbtreekey2, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bool_same(public.gbtreekey2, public.gbtreekey2, internal) TO service_role;


--
-- Name: FUNCTION gbt_bool_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bool_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bool_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bool_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bool_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_bpchar_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bpchar_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bpchar_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bpchar_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bpchar_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_bpchar_consistent(internal, character, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bpchar_consistent(internal, character, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bpchar_consistent(internal, character, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bpchar_consistent(internal, character, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bpchar_consistent(internal, character, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_bytea_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bytea_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bytea_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bytea_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bytea_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_bytea_consistent(internal, bytea, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bytea_consistent(internal, bytea, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bytea_consistent(internal, bytea, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bytea_consistent(internal, bytea, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bytea_consistent(internal, bytea, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_bytea_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bytea_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bytea_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bytea_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bytea_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_bytea_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bytea_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bytea_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bytea_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bytea_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_bytea_same(public.gbtreekey_var, public.gbtreekey_var, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bytea_same(public.gbtreekey_var, public.gbtreekey_var, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bytea_same(public.gbtreekey_var, public.gbtreekey_var, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bytea_same(public.gbtreekey_var, public.gbtreekey_var, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bytea_same(public.gbtreekey_var, public.gbtreekey_var, internal) TO service_role;


--
-- Name: FUNCTION gbt_bytea_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_bytea_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_bytea_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_bytea_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_bytea_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_cash_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_cash_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_cash_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_cash_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_cash_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_cash_consistent(internal, money, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_cash_consistent(internal, money, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_cash_consistent(internal, money, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_cash_consistent(internal, money, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_cash_consistent(internal, money, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_cash_distance(internal, money, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_cash_distance(internal, money, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_cash_distance(internal, money, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_cash_distance(internal, money, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_cash_distance(internal, money, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_cash_fetch(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_cash_fetch(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_cash_fetch(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_cash_fetch(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_cash_fetch(internal) TO service_role;


--
-- Name: FUNCTION gbt_cash_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_cash_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_cash_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_cash_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_cash_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_cash_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_cash_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_cash_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_cash_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_cash_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_cash_same(public.gbtreekey16, public.gbtreekey16, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_cash_same(public.gbtreekey16, public.gbtreekey16, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_cash_same(public.gbtreekey16, public.gbtreekey16, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_cash_same(public.gbtreekey16, public.gbtreekey16, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_cash_same(public.gbtreekey16, public.gbtreekey16, internal) TO service_role;


--
-- Name: FUNCTION gbt_cash_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_cash_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_cash_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_cash_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_cash_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_date_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_date_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_date_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_date_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_date_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_date_consistent(internal, date, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_date_consistent(internal, date, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_date_consistent(internal, date, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_date_consistent(internal, date, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_date_consistent(internal, date, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_date_distance(internal, date, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_date_distance(internal, date, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_date_distance(internal, date, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_date_distance(internal, date, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_date_distance(internal, date, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_date_fetch(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_date_fetch(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_date_fetch(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_date_fetch(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_date_fetch(internal) TO service_role;


--
-- Name: FUNCTION gbt_date_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_date_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_date_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_date_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_date_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_date_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_date_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_date_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_date_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_date_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_date_same(public.gbtreekey8, public.gbtreekey8, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_date_same(public.gbtreekey8, public.gbtreekey8, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_date_same(public.gbtreekey8, public.gbtreekey8, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_date_same(public.gbtreekey8, public.gbtreekey8, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_date_same(public.gbtreekey8, public.gbtreekey8, internal) TO service_role;


--
-- Name: FUNCTION gbt_date_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_date_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_date_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_date_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_date_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_decompress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_decompress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_decompress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_decompress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_decompress(internal) TO service_role;


--
-- Name: FUNCTION gbt_enum_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_enum_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_enum_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_enum_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_enum_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_enum_consistent(internal, anyenum, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_enum_consistent(internal, anyenum, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_enum_consistent(internal, anyenum, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_enum_consistent(internal, anyenum, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_enum_consistent(internal, anyenum, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_enum_fetch(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_enum_fetch(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_enum_fetch(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_enum_fetch(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_enum_fetch(internal) TO service_role;


--
-- Name: FUNCTION gbt_enum_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_enum_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_enum_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_enum_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_enum_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_enum_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_enum_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_enum_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_enum_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_enum_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_enum_same(public.gbtreekey8, public.gbtreekey8, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_enum_same(public.gbtreekey8, public.gbtreekey8, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_enum_same(public.gbtreekey8, public.gbtreekey8, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_enum_same(public.gbtreekey8, public.gbtreekey8, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_enum_same(public.gbtreekey8, public.gbtreekey8, internal) TO service_role;


--
-- Name: FUNCTION gbt_enum_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_enum_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_enum_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_enum_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_enum_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_float4_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_float4_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_float4_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_float4_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_float4_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_float4_consistent(internal, real, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_float4_consistent(internal, real, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_float4_consistent(internal, real, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_float4_consistent(internal, real, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_float4_consistent(internal, real, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_float4_distance(internal, real, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_float4_distance(internal, real, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_float4_distance(internal, real, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_float4_distance(internal, real, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_float4_distance(internal, real, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_float4_fetch(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_float4_fetch(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_float4_fetch(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_float4_fetch(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_float4_fetch(internal) TO service_role;


--
-- Name: FUNCTION gbt_float4_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_float4_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_float4_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_float4_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_float4_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_float4_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_float4_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_float4_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_float4_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_float4_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_float4_same(public.gbtreekey8, public.gbtreekey8, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_float4_same(public.gbtreekey8, public.gbtreekey8, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_float4_same(public.gbtreekey8, public.gbtreekey8, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_float4_same(public.gbtreekey8, public.gbtreekey8, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_float4_same(public.gbtreekey8, public.gbtreekey8, internal) TO service_role;


--
-- Name: FUNCTION gbt_float4_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_float4_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_float4_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_float4_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_float4_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_float8_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_float8_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_float8_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_float8_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_float8_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_float8_consistent(internal, double precision, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_float8_consistent(internal, double precision, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_float8_consistent(internal, double precision, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_float8_consistent(internal, double precision, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_float8_consistent(internal, double precision, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_float8_distance(internal, double precision, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_float8_distance(internal, double precision, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_float8_distance(internal, double precision, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_float8_distance(internal, double precision, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_float8_distance(internal, double precision, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_float8_fetch(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_float8_fetch(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_float8_fetch(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_float8_fetch(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_float8_fetch(internal) TO service_role;


--
-- Name: FUNCTION gbt_float8_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_float8_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_float8_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_float8_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_float8_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_float8_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_float8_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_float8_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_float8_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_float8_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_float8_same(public.gbtreekey16, public.gbtreekey16, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_float8_same(public.gbtreekey16, public.gbtreekey16, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_float8_same(public.gbtreekey16, public.gbtreekey16, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_float8_same(public.gbtreekey16, public.gbtreekey16, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_float8_same(public.gbtreekey16, public.gbtreekey16, internal) TO service_role;


--
-- Name: FUNCTION gbt_float8_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_float8_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_float8_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_float8_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_float8_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_inet_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_inet_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_inet_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_inet_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_inet_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_inet_consistent(internal, inet, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_inet_consistent(internal, inet, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_inet_consistent(internal, inet, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_inet_consistent(internal, inet, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_inet_consistent(internal, inet, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_inet_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_inet_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_inet_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_inet_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_inet_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_inet_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_inet_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_inet_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_inet_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_inet_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_inet_same(public.gbtreekey16, public.gbtreekey16, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_inet_same(public.gbtreekey16, public.gbtreekey16, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_inet_same(public.gbtreekey16, public.gbtreekey16, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_inet_same(public.gbtreekey16, public.gbtreekey16, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_inet_same(public.gbtreekey16, public.gbtreekey16, internal) TO service_role;


--
-- Name: FUNCTION gbt_inet_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_inet_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_inet_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_inet_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_inet_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_int2_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int2_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int2_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int2_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int2_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_int2_consistent(internal, smallint, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int2_consistent(internal, smallint, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int2_consistent(internal, smallint, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int2_consistent(internal, smallint, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int2_consistent(internal, smallint, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_int2_distance(internal, smallint, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int2_distance(internal, smallint, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int2_distance(internal, smallint, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int2_distance(internal, smallint, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int2_distance(internal, smallint, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_int2_fetch(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int2_fetch(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int2_fetch(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int2_fetch(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int2_fetch(internal) TO service_role;


--
-- Name: FUNCTION gbt_int2_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int2_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int2_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int2_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int2_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_int2_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int2_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int2_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int2_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int2_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_int2_same(public.gbtreekey4, public.gbtreekey4, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int2_same(public.gbtreekey4, public.gbtreekey4, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int2_same(public.gbtreekey4, public.gbtreekey4, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int2_same(public.gbtreekey4, public.gbtreekey4, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int2_same(public.gbtreekey4, public.gbtreekey4, internal) TO service_role;


--
-- Name: FUNCTION gbt_int2_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int2_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int2_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int2_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int2_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_int4_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int4_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int4_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int4_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int4_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_int4_consistent(internal, integer, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int4_consistent(internal, integer, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int4_consistent(internal, integer, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int4_consistent(internal, integer, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int4_consistent(internal, integer, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_int4_distance(internal, integer, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int4_distance(internal, integer, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int4_distance(internal, integer, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int4_distance(internal, integer, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int4_distance(internal, integer, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_int4_fetch(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int4_fetch(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int4_fetch(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int4_fetch(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int4_fetch(internal) TO service_role;


--
-- Name: FUNCTION gbt_int4_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int4_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int4_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int4_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int4_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_int4_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int4_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int4_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int4_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int4_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_int4_same(public.gbtreekey8, public.gbtreekey8, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int4_same(public.gbtreekey8, public.gbtreekey8, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int4_same(public.gbtreekey8, public.gbtreekey8, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int4_same(public.gbtreekey8, public.gbtreekey8, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int4_same(public.gbtreekey8, public.gbtreekey8, internal) TO service_role;


--
-- Name: FUNCTION gbt_int4_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int4_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int4_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int4_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int4_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_int8_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int8_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int8_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int8_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int8_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_int8_consistent(internal, bigint, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int8_consistent(internal, bigint, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int8_consistent(internal, bigint, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int8_consistent(internal, bigint, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int8_consistent(internal, bigint, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_int8_distance(internal, bigint, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int8_distance(internal, bigint, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int8_distance(internal, bigint, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int8_distance(internal, bigint, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int8_distance(internal, bigint, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_int8_fetch(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int8_fetch(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int8_fetch(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int8_fetch(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int8_fetch(internal) TO service_role;


--
-- Name: FUNCTION gbt_int8_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int8_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int8_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int8_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int8_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_int8_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int8_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int8_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int8_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int8_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_int8_same(public.gbtreekey16, public.gbtreekey16, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int8_same(public.gbtreekey16, public.gbtreekey16, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int8_same(public.gbtreekey16, public.gbtreekey16, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int8_same(public.gbtreekey16, public.gbtreekey16, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int8_same(public.gbtreekey16, public.gbtreekey16, internal) TO service_role;


--
-- Name: FUNCTION gbt_int8_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_int8_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_int8_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_int8_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_int8_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_intv_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_intv_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_intv_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_intv_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_intv_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_intv_consistent(internal, interval, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_intv_consistent(internal, interval, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_intv_consistent(internal, interval, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_intv_consistent(internal, interval, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_intv_consistent(internal, interval, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_intv_decompress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_intv_decompress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_intv_decompress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_intv_decompress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_intv_decompress(internal) TO service_role;


--
-- Name: FUNCTION gbt_intv_distance(internal, interval, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_intv_distance(internal, interval, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_intv_distance(internal, interval, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_intv_distance(internal, interval, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_intv_distance(internal, interval, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_intv_fetch(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_intv_fetch(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_intv_fetch(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_intv_fetch(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_intv_fetch(internal) TO service_role;


--
-- Name: FUNCTION gbt_intv_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_intv_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_intv_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_intv_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_intv_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_intv_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_intv_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_intv_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_intv_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_intv_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_intv_same(public.gbtreekey32, public.gbtreekey32, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_intv_same(public.gbtreekey32, public.gbtreekey32, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_intv_same(public.gbtreekey32, public.gbtreekey32, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_intv_same(public.gbtreekey32, public.gbtreekey32, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_intv_same(public.gbtreekey32, public.gbtreekey32, internal) TO service_role;


--
-- Name: FUNCTION gbt_intv_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_intv_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_intv_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_intv_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_intv_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_macad8_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_macad8_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_macad8_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_macad8_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_macad8_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_macad8_consistent(internal, macaddr8, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_macad8_consistent(internal, macaddr8, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_macad8_consistent(internal, macaddr8, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_macad8_consistent(internal, macaddr8, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_macad8_consistent(internal, macaddr8, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_macad8_fetch(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_macad8_fetch(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_macad8_fetch(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_macad8_fetch(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_macad8_fetch(internal) TO service_role;


--
-- Name: FUNCTION gbt_macad8_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_macad8_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_macad8_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_macad8_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_macad8_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_macad8_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_macad8_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_macad8_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_macad8_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_macad8_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_macad8_same(public.gbtreekey16, public.gbtreekey16, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_macad8_same(public.gbtreekey16, public.gbtreekey16, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_macad8_same(public.gbtreekey16, public.gbtreekey16, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_macad8_same(public.gbtreekey16, public.gbtreekey16, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_macad8_same(public.gbtreekey16, public.gbtreekey16, internal) TO service_role;


--
-- Name: FUNCTION gbt_macad8_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_macad8_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_macad8_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_macad8_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_macad8_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_macad_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_macad_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_macad_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_macad_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_macad_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_macad_consistent(internal, macaddr, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_macad_consistent(internal, macaddr, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_macad_consistent(internal, macaddr, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_macad_consistent(internal, macaddr, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_macad_consistent(internal, macaddr, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_macad_fetch(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_macad_fetch(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_macad_fetch(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_macad_fetch(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_macad_fetch(internal) TO service_role;


--
-- Name: FUNCTION gbt_macad_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_macad_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_macad_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_macad_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_macad_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_macad_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_macad_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_macad_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_macad_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_macad_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_macad_same(public.gbtreekey16, public.gbtreekey16, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_macad_same(public.gbtreekey16, public.gbtreekey16, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_macad_same(public.gbtreekey16, public.gbtreekey16, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_macad_same(public.gbtreekey16, public.gbtreekey16, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_macad_same(public.gbtreekey16, public.gbtreekey16, internal) TO service_role;


--
-- Name: FUNCTION gbt_macad_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_macad_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_macad_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_macad_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_macad_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_numeric_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_numeric_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_numeric_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_numeric_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_numeric_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_numeric_consistent(internal, numeric, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_numeric_consistent(internal, numeric, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_numeric_consistent(internal, numeric, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_numeric_consistent(internal, numeric, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_numeric_consistent(internal, numeric, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_numeric_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_numeric_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_numeric_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_numeric_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_numeric_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_numeric_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_numeric_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_numeric_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_numeric_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_numeric_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_numeric_same(public.gbtreekey_var, public.gbtreekey_var, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_numeric_same(public.gbtreekey_var, public.gbtreekey_var, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_numeric_same(public.gbtreekey_var, public.gbtreekey_var, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_numeric_same(public.gbtreekey_var, public.gbtreekey_var, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_numeric_same(public.gbtreekey_var, public.gbtreekey_var, internal) TO service_role;


--
-- Name: FUNCTION gbt_numeric_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_numeric_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_numeric_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_numeric_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_numeric_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_oid_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_oid_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_oid_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_oid_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_oid_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_oid_consistent(internal, oid, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_oid_consistent(internal, oid, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_oid_consistent(internal, oid, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_oid_consistent(internal, oid, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_oid_consistent(internal, oid, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_oid_distance(internal, oid, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_oid_distance(internal, oid, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_oid_distance(internal, oid, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_oid_distance(internal, oid, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_oid_distance(internal, oid, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_oid_fetch(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_oid_fetch(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_oid_fetch(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_oid_fetch(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_oid_fetch(internal) TO service_role;


--
-- Name: FUNCTION gbt_oid_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_oid_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_oid_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_oid_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_oid_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_oid_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_oid_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_oid_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_oid_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_oid_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_oid_same(public.gbtreekey8, public.gbtreekey8, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_oid_same(public.gbtreekey8, public.gbtreekey8, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_oid_same(public.gbtreekey8, public.gbtreekey8, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_oid_same(public.gbtreekey8, public.gbtreekey8, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_oid_same(public.gbtreekey8, public.gbtreekey8, internal) TO service_role;


--
-- Name: FUNCTION gbt_oid_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_oid_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_oid_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_oid_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_oid_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_text_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_text_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_text_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_text_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_text_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_text_consistent(internal, text, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_text_consistent(internal, text, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_text_consistent(internal, text, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_text_consistent(internal, text, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_text_consistent(internal, text, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_text_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_text_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_text_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_text_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_text_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_text_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_text_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_text_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_text_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_text_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_text_same(public.gbtreekey_var, public.gbtreekey_var, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_text_same(public.gbtreekey_var, public.gbtreekey_var, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_text_same(public.gbtreekey_var, public.gbtreekey_var, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_text_same(public.gbtreekey_var, public.gbtreekey_var, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_text_same(public.gbtreekey_var, public.gbtreekey_var, internal) TO service_role;


--
-- Name: FUNCTION gbt_text_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_text_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_text_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_text_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_text_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_time_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_time_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_time_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_time_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_time_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_time_consistent(internal, time without time zone, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_time_consistent(internal, time without time zone, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_time_consistent(internal, time without time zone, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_time_consistent(internal, time without time zone, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_time_consistent(internal, time without time zone, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_time_distance(internal, time without time zone, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_time_distance(internal, time without time zone, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_time_distance(internal, time without time zone, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_time_distance(internal, time without time zone, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_time_distance(internal, time without time zone, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_time_fetch(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_time_fetch(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_time_fetch(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_time_fetch(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_time_fetch(internal) TO service_role;


--
-- Name: FUNCTION gbt_time_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_time_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_time_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_time_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_time_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_time_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_time_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_time_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_time_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_time_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_time_same(public.gbtreekey16, public.gbtreekey16, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_time_same(public.gbtreekey16, public.gbtreekey16, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_time_same(public.gbtreekey16, public.gbtreekey16, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_time_same(public.gbtreekey16, public.gbtreekey16, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_time_same(public.gbtreekey16, public.gbtreekey16, internal) TO service_role;


--
-- Name: FUNCTION gbt_time_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_time_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_time_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_time_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_time_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_timetz_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_timetz_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_timetz_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_timetz_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_timetz_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_timetz_consistent(internal, time with time zone, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_timetz_consistent(internal, time with time zone, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_timetz_consistent(internal, time with time zone, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_timetz_consistent(internal, time with time zone, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_timetz_consistent(internal, time with time zone, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_ts_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_ts_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_ts_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_ts_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_ts_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_ts_consistent(internal, timestamp without time zone, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_ts_consistent(internal, timestamp without time zone, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_ts_consistent(internal, timestamp without time zone, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_ts_consistent(internal, timestamp without time zone, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_ts_consistent(internal, timestamp without time zone, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_ts_distance(internal, timestamp without time zone, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_ts_distance(internal, timestamp without time zone, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_ts_distance(internal, timestamp without time zone, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_ts_distance(internal, timestamp without time zone, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_ts_distance(internal, timestamp without time zone, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_ts_fetch(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_ts_fetch(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_ts_fetch(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_ts_fetch(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_ts_fetch(internal) TO service_role;


--
-- Name: FUNCTION gbt_ts_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_ts_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_ts_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_ts_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_ts_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_ts_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_ts_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_ts_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_ts_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_ts_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_ts_same(public.gbtreekey16, public.gbtreekey16, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_ts_same(public.gbtreekey16, public.gbtreekey16, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_ts_same(public.gbtreekey16, public.gbtreekey16, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_ts_same(public.gbtreekey16, public.gbtreekey16, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_ts_same(public.gbtreekey16, public.gbtreekey16, internal) TO service_role;


--
-- Name: FUNCTION gbt_ts_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_ts_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_ts_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_ts_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_ts_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_tstz_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_tstz_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_tstz_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_tstz_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_tstz_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_tstz_consistent(internal, timestamp with time zone, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_tstz_consistent(internal, timestamp with time zone, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_tstz_consistent(internal, timestamp with time zone, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_tstz_consistent(internal, timestamp with time zone, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_tstz_consistent(internal, timestamp with time zone, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_tstz_distance(internal, timestamp with time zone, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_tstz_distance(internal, timestamp with time zone, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_tstz_distance(internal, timestamp with time zone, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_tstz_distance(internal, timestamp with time zone, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_tstz_distance(internal, timestamp with time zone, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_uuid_compress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_uuid_compress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_uuid_compress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_uuid_compress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_uuid_compress(internal) TO service_role;


--
-- Name: FUNCTION gbt_uuid_consistent(internal, uuid, smallint, oid, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_uuid_consistent(internal, uuid, smallint, oid, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_uuid_consistent(internal, uuid, smallint, oid, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_uuid_consistent(internal, uuid, smallint, oid, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_uuid_consistent(internal, uuid, smallint, oid, internal) TO service_role;


--
-- Name: FUNCTION gbt_uuid_fetch(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_uuid_fetch(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_uuid_fetch(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_uuid_fetch(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_uuid_fetch(internal) TO service_role;


--
-- Name: FUNCTION gbt_uuid_penalty(internal, internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_uuid_penalty(internal, internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_uuid_penalty(internal, internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_uuid_penalty(internal, internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_uuid_penalty(internal, internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_uuid_picksplit(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_uuid_picksplit(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_uuid_picksplit(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_uuid_picksplit(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_uuid_picksplit(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_uuid_same(public.gbtreekey32, public.gbtreekey32, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_uuid_same(public.gbtreekey32, public.gbtreekey32, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_uuid_same(public.gbtreekey32, public.gbtreekey32, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_uuid_same(public.gbtreekey32, public.gbtreekey32, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_uuid_same(public.gbtreekey32, public.gbtreekey32, internal) TO service_role;


--
-- Name: FUNCTION gbt_uuid_union(internal, internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_uuid_union(internal, internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_uuid_union(internal, internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_uuid_union(internal, internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_uuid_union(internal, internal) TO service_role;


--
-- Name: FUNCTION gbt_var_decompress(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_var_decompress(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_var_decompress(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_var_decompress(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_var_decompress(internal) TO service_role;


--
-- Name: FUNCTION gbt_var_fetch(internal); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.gbt_var_fetch(internal) TO postgres;
GRANT ALL ON FUNCTION public.gbt_var_fetch(internal) TO anon;
GRANT ALL ON FUNCTION public.gbt_var_fetch(internal) TO authenticated;
GRANT ALL ON FUNCTION public.gbt_var_fetch(internal) TO service_role;


--
-- Name: FUNCTION increment_menu_coupon_usage(p_coupon_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.increment_menu_coupon_usage(p_coupon_id uuid) TO anon;
GRANT ALL ON FUNCTION public.increment_menu_coupon_usage(p_coupon_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.increment_menu_coupon_usage(p_coupon_id uuid) TO service_role;


--
-- Name: FUNCTION int2_dist(smallint, smallint); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.int2_dist(smallint, smallint) TO postgres;
GRANT ALL ON FUNCTION public.int2_dist(smallint, smallint) TO anon;
GRANT ALL ON FUNCTION public.int2_dist(smallint, smallint) TO authenticated;
GRANT ALL ON FUNCTION public.int2_dist(smallint, smallint) TO service_role;


--
-- Name: FUNCTION int4_dist(integer, integer); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.int4_dist(integer, integer) TO postgres;
GRANT ALL ON FUNCTION public.int4_dist(integer, integer) TO anon;
GRANT ALL ON FUNCTION public.int4_dist(integer, integer) TO authenticated;
GRANT ALL ON FUNCTION public.int4_dist(integer, integer) TO service_role;


--
-- Name: FUNCTION int8_dist(bigint, bigint); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.int8_dist(bigint, bigint) TO postgres;
GRANT ALL ON FUNCTION public.int8_dist(bigint, bigint) TO anon;
GRANT ALL ON FUNCTION public.int8_dist(bigint, bigint) TO authenticated;
GRANT ALL ON FUNCTION public.int8_dist(bigint, bigint) TO service_role;


--
-- Name: FUNCTION interval_dist(interval, interval); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.interval_dist(interval, interval) TO postgres;
GRANT ALL ON FUNCTION public.interval_dist(interval, interval) TO anon;
GRANT ALL ON FUNCTION public.interval_dist(interval, interval) TO authenticated;
GRANT ALL ON FUNCTION public.interval_dist(interval, interval) TO service_role;


--
-- Name: FUNCTION oid_dist(oid, oid); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.oid_dist(oid, oid) TO postgres;
GRANT ALL ON FUNCTION public.oid_dist(oid, oid) TO anon;
GRANT ALL ON FUNCTION public.oid_dist(oid, oid) TO authenticated;
GRANT ALL ON FUNCTION public.oid_dist(oid, oid) TO service_role;


--
-- Name: FUNCTION orders_set_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.orders_set_updated_at() TO anon;
GRANT ALL ON FUNCTION public.orders_set_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.orders_set_updated_at() TO service_role;


--
-- Name: FUNCTION recalculate_loyalty_tier(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.recalculate_loyalty_tier() TO anon;
GRANT ALL ON FUNCTION public.recalculate_loyalty_tier() TO authenticated;
GRANT ALL ON FUNCTION public.recalculate_loyalty_tier() TO service_role;


--
-- Name: FUNCTION recalculate_member_tier(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.recalculate_member_tier() TO anon;
GRANT ALL ON FUNCTION public.recalculate_member_tier() TO authenticated;
GRANT ALL ON FUNCTION public.recalculate_member_tier() TO service_role;


--
-- Name: FUNCTION restaurant_drivers_set_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.restaurant_drivers_set_updated_at() TO anon;
GRANT ALL ON FUNCTION public.restaurant_drivers_set_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.restaurant_drivers_set_updated_at() TO service_role;


--
-- Name: FUNCTION restaurant_rating_stats(p_ids uuid[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.restaurant_rating_stats(p_ids uuid[]) TO anon;
GRANT ALL ON FUNCTION public.restaurant_rating_stats(p_ids uuid[]) TO authenticated;
GRANT ALL ON FUNCTION public.restaurant_rating_stats(p_ids uuid[]) TO service_role;


--
-- Name: FUNCTION rls_auto_enable(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.rls_auto_enable() TO anon;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO authenticated;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO service_role;


--
-- Name: FUNCTION sync_pms_reservation_totals(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.sync_pms_reservation_totals() TO anon;
GRANT ALL ON FUNCTION public.sync_pms_reservation_totals() TO authenticated;
GRANT ALL ON FUNCTION public.sync_pms_reservation_totals() TO service_role;


--
-- Name: FUNCTION time_dist(time without time zone, time without time zone); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.time_dist(time without time zone, time without time zone) TO postgres;
GRANT ALL ON FUNCTION public.time_dist(time without time zone, time without time zone) TO anon;
GRANT ALL ON FUNCTION public.time_dist(time without time zone, time without time zone) TO authenticated;
GRANT ALL ON FUNCTION public.time_dist(time without time zone, time without time zone) TO service_role;


--
-- Name: FUNCTION touch_delivery_tiers_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.touch_delivery_tiers_updated_at() TO anon;
GRANT ALL ON FUNCTION public.touch_delivery_tiers_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.touch_delivery_tiers_updated_at() TO service_role;


--
-- Name: FUNCTION touch_fast_delivery_tiers_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.touch_fast_delivery_tiers_updated_at() TO anon;
GRANT ALL ON FUNCTION public.touch_fast_delivery_tiers_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.touch_fast_delivery_tiers_updated_at() TO service_role;


--
-- Name: FUNCTION touch_restaurant_stock_sync_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.touch_restaurant_stock_sync_updated_at() TO anon;
GRANT ALL ON FUNCTION public.touch_restaurant_stock_sync_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.touch_restaurant_stock_sync_updated_at() TO service_role;


--
-- Name: FUNCTION ts_dist(timestamp without time zone, timestamp without time zone); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.ts_dist(timestamp without time zone, timestamp without time zone) TO postgres;
GRANT ALL ON FUNCTION public.ts_dist(timestamp without time zone, timestamp without time zone) TO anon;
GRANT ALL ON FUNCTION public.ts_dist(timestamp without time zone, timestamp without time zone) TO authenticated;
GRANT ALL ON FUNCTION public.ts_dist(timestamp without time zone, timestamp without time zone) TO service_role;


--
-- Name: FUNCTION tstz_dist(timestamp with time zone, timestamp with time zone); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.tstz_dist(timestamp with time zone, timestamp with time zone) TO postgres;
GRANT ALL ON FUNCTION public.tstz_dist(timestamp with time zone, timestamp with time zone) TO anon;
GRANT ALL ON FUNCTION public.tstz_dist(timestamp with time zone, timestamp with time zone) TO authenticated;
GRANT ALL ON FUNCTION public.tstz_dist(timestamp with time zone, timestamp with time zone) TO service_role;


--
-- Name: FUNCTION update_inventory_qty(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_inventory_qty() TO anon;
GRANT ALL ON FUNCTION public.update_inventory_qty() TO authenticated;
GRANT ALL ON FUNCTION public.update_inventory_qty() TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO service_role;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION send_binary(payload bytea, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION wal2json_escape_identifier(name text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO postgres;
GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE custom_oauth_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.custom_oauth_providers TO postgres;
GRANT ALL ON TABLE auth.custom_oauth_providers TO dashboard_user;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_client_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_client_states TO postgres;
GRANT ALL ON TABLE auth.oauth_client_states TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE webauthn_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_challenges TO postgres;
GRANT ALL ON TABLE auth.webauthn_challenges TO dashboard_user;


--
-- Name: TABLE webauthn_credentials; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_credentials TO postgres;
GRANT ALL ON TABLE auth.webauthn_credentials TO dashboard_user;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE accounting_expenses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.accounting_expenses TO anon;
GRANT ALL ON TABLE public.accounting_expenses TO authenticated;
GRANT ALL ON TABLE public.accounting_expenses TO service_role;


--
-- Name: TABLE categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.categories TO anon;
GRANT ALL ON TABLE public.categories TO authenticated;
GRANT ALL ON TABLE public.categories TO service_role;


--
-- Name: TABLE club_check_ins; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.club_check_ins TO anon;
GRANT ALL ON TABLE public.club_check_ins TO authenticated;
GRANT ALL ON TABLE public.club_check_ins TO service_role;


--
-- Name: TABLE club_invoices; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.club_invoices TO anon;
GRANT ALL ON TABLE public.club_invoices TO authenticated;
GRANT ALL ON TABLE public.club_invoices TO service_role;


--
-- Name: TABLE club_members; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.club_members TO anon;
GRANT ALL ON TABLE public.club_members TO authenticated;
GRANT ALL ON TABLE public.club_members TO service_role;


--
-- Name: TABLE club_plans; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.club_plans TO anon;
GRANT ALL ON TABLE public.club_plans TO authenticated;
GRANT ALL ON TABLE public.club_plans TO service_role;


--
-- Name: TABLE crm_customer_notes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.crm_customer_notes TO anon;
GRANT ALL ON TABLE public.crm_customer_notes TO authenticated;
GRANT ALL ON TABLE public.crm_customer_notes TO service_role;


--
-- Name: TABLE crm_customer_tag_assignments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.crm_customer_tag_assignments TO anon;
GRANT ALL ON TABLE public.crm_customer_tag_assignments TO authenticated;
GRANT ALL ON TABLE public.crm_customer_tag_assignments TO service_role;


--
-- Name: TABLE crm_customers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.crm_customers TO anon;
GRANT ALL ON TABLE public.crm_customers TO authenticated;
GRANT ALL ON TABLE public.crm_customers TO service_role;


--
-- Name: TABLE crm_tags; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.crm_tags TO anon;
GRANT ALL ON TABLE public.crm_tags TO authenticated;
GRANT ALL ON TABLE public.crm_tags TO service_role;


--
-- Name: TABLE customer_addresses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.customer_addresses TO anon;
GRANT ALL ON TABLE public.customer_addresses TO authenticated;
GRANT ALL ON TABLE public.customer_addresses TO service_role;


--
-- Name: TABLE customer_profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.customer_profiles TO anon;
GRANT ALL ON TABLE public.customer_profiles TO authenticated;
GRANT ALL ON TABLE public.customer_profiles TO service_role;


--
-- Name: TABLE customer_signup_otps; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.customer_signup_otps TO anon;
GRANT ALL ON TABLE public.customer_signup_otps TO authenticated;
GRANT ALL ON TABLE public.customer_signup_otps TO service_role;


--
-- Name: TABLE ecommerce_delivery_zones; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ecommerce_delivery_zones TO anon;
GRANT ALL ON TABLE public.ecommerce_delivery_zones TO authenticated;
GRANT ALL ON TABLE public.ecommerce_delivery_zones TO service_role;


--
-- Name: TABLE ecommerce_order_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ecommerce_order_items TO anon;
GRANT ALL ON TABLE public.ecommerce_order_items TO authenticated;
GRANT ALL ON TABLE public.ecommerce_order_items TO service_role;


--
-- Name: TABLE ecommerce_orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ecommerce_orders TO anon;
GRANT ALL ON TABLE public.ecommerce_orders TO authenticated;
GRANT ALL ON TABLE public.ecommerce_orders TO service_role;


--
-- Name: TABLE ecommerce_stores; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ecommerce_stores TO anon;
GRANT ALL ON TABLE public.ecommerce_stores TO authenticated;
GRANT ALL ON TABLE public.ecommerce_stores TO service_role;


--
-- Name: TABLE event_booking_packages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.event_booking_packages TO anon;
GRANT ALL ON TABLE public.event_booking_packages TO authenticated;
GRANT ALL ON TABLE public.event_booking_packages TO service_role;


--
-- Name: TABLE event_bookings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.event_bookings TO anon;
GRANT ALL ON TABLE public.event_bookings TO authenticated;
GRANT ALL ON TABLE public.event_bookings TO service_role;


--
-- Name: TABLE event_packages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.event_packages TO anon;
GRANT ALL ON TABLE public.event_packages TO authenticated;
GRANT ALL ON TABLE public.event_packages TO service_role;


--
-- Name: TABLE event_spaces; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.event_spaces TO anon;
GRANT ALL ON TABLE public.event_spaces TO authenticated;
GRANT ALL ON TABLE public.event_spaces TO service_role;


--
-- Name: TABLE fleet_deliveries; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.fleet_deliveries TO anon;
GRANT ALL ON TABLE public.fleet_deliveries TO authenticated;
GRANT ALL ON TABLE public.fleet_deliveries TO service_role;


--
-- Name: TABLE fleet_drivers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.fleet_drivers TO anon;
GRANT ALL ON TABLE public.fleet_drivers TO authenticated;
GRANT ALL ON TABLE public.fleet_drivers TO service_role;


--
-- Name: TABLE fleet_vehicle_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.fleet_vehicle_logs TO anon;
GRANT ALL ON TABLE public.fleet_vehicle_logs TO authenticated;
GRANT ALL ON TABLE public.fleet_vehicle_logs TO service_role;


--
-- Name: TABLE fleet_vehicles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.fleet_vehicles TO anon;
GRANT ALL ON TABLE public.fleet_vehicles TO authenticated;
GRANT ALL ON TABLE public.fleet_vehicles TO service_role;


--
-- Name: TABLE gym_member_packages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.gym_member_packages TO anon;
GRANT ALL ON TABLE public.gym_member_packages TO authenticated;
GRANT ALL ON TABLE public.gym_member_packages TO service_role;


--
-- Name: TABLE gym_pt_packages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.gym_pt_packages TO anon;
GRANT ALL ON TABLE public.gym_pt_packages TO authenticated;
GRANT ALL ON TABLE public.gym_pt_packages TO service_role;


--
-- Name: TABLE gym_pt_sessions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.gym_pt_sessions TO anon;
GRANT ALL ON TABLE public.gym_pt_sessions TO authenticated;
GRANT ALL ON TABLE public.gym_pt_sessions TO service_role;


--
-- Name: TABLE gym_trainer_payouts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.gym_trainer_payouts TO anon;
GRANT ALL ON TABLE public.gym_trainer_payouts TO authenticated;
GRANT ALL ON TABLE public.gym_trainer_payouts TO service_role;


--
-- Name: TABLE gym_trainers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.gym_trainers TO anon;
GRANT ALL ON TABLE public.gym_trainers TO authenticated;
GRANT ALL ON TABLE public.gym_trainers TO service_role;


--
-- Name: TABLE inventory_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.inventory_items TO anon;
GRANT ALL ON TABLE public.inventory_items TO authenticated;
GRANT ALL ON TABLE public.inventory_items TO service_role;


--
-- Name: TABLE inventory_movements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.inventory_movements TO anon;
GRANT ALL ON TABLE public.inventory_movements TO authenticated;
GRANT ALL ON TABLE public.inventory_movements TO service_role;


--
-- Name: TABLE invoices; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.invoices TO anon;
GRANT ALL ON TABLE public.invoices TO authenticated;
GRANT ALL ON TABLE public.invoices TO service_role;


--
-- Name: TABLE loyalty_members; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.loyalty_members TO anon;
GRANT ALL ON TABLE public.loyalty_members TO authenticated;
GRANT ALL ON TABLE public.loyalty_members TO service_role;


--
-- Name: TABLE loyalty_programs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.loyalty_programs TO anon;
GRANT ALL ON TABLE public.loyalty_programs TO authenticated;
GRANT ALL ON TABLE public.loyalty_programs TO service_role;


--
-- Name: TABLE loyalty_transactions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.loyalty_transactions TO anon;
GRANT ALL ON TABLE public.loyalty_transactions TO authenticated;
GRANT ALL ON TABLE public.loyalty_transactions TO service_role;


--
-- Name: TABLE menu_brands; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.menu_brands TO anon;
GRANT ALL ON TABLE public.menu_brands TO authenticated;
GRANT ALL ON TABLE public.menu_brands TO service_role;


--
-- Name: TABLE menu_coupon_codes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.menu_coupon_codes TO anon;
GRANT ALL ON TABLE public.menu_coupon_codes TO authenticated;
GRANT ALL ON TABLE public.menu_coupon_codes TO service_role;


--
-- Name: TABLE menu_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.menu_items TO anon;
GRANT ALL ON TABLE public.menu_items TO authenticated;
GRANT ALL ON TABLE public.menu_items TO service_role;


--
-- Name: TABLE menu_promotions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.menu_promotions TO anon;
GRANT ALL ON TABLE public.menu_promotions TO authenticated;
GRANT ALL ON TABLE public.menu_promotions TO service_role;


--
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.orders TO anon;
GRANT ALL ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;


--
-- Name: TABLE password_change_otps; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.password_change_otps TO anon;
GRANT ALL ON TABLE public.password_change_otps TO authenticated;
GRANT ALL ON TABLE public.password_change_otps TO service_role;


--
-- Name: TABLE payments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payments TO anon;
GRANT ALL ON TABLE public.payments TO authenticated;
GRANT ALL ON TABLE public.payments TO service_role;


--
-- Name: TABLE payroll_entries; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payroll_entries TO anon;
GRANT ALL ON TABLE public.payroll_entries TO authenticated;
GRANT ALL ON TABLE public.payroll_entries TO service_role;


--
-- Name: TABLE payroll_runs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payroll_runs TO anon;
GRANT ALL ON TABLE public.payroll_runs TO authenticated;
GRANT ALL ON TABLE public.payroll_runs TO service_role;


--
-- Name: TABLE platform_ops_payment_reminder_log; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.platform_ops_payment_reminder_log TO anon;
GRANT ALL ON TABLE public.platform_ops_payment_reminder_log TO authenticated;
GRANT ALL ON TABLE public.platform_ops_payment_reminder_log TO service_role;


--
-- Name: TABLE platform_ops_payments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.platform_ops_payments TO anon;
GRANT ALL ON TABLE public.platform_ops_payments TO authenticated;
GRANT ALL ON TABLE public.platform_ops_payments TO service_role;


--
-- Name: TABLE pms_charges; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pms_charges TO anon;
GRANT ALL ON TABLE public.pms_charges TO authenticated;
GRANT ALL ON TABLE public.pms_charges TO service_role;


--
-- Name: TABLE pms_housekeeping_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pms_housekeeping_logs TO anon;
GRANT ALL ON TABLE public.pms_housekeeping_logs TO authenticated;
GRANT ALL ON TABLE public.pms_housekeeping_logs TO service_role;


--
-- Name: TABLE pms_reservations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pms_reservations TO anon;
GRANT ALL ON TABLE public.pms_reservations TO authenticated;
GRANT ALL ON TABLE public.pms_reservations TO service_role;


--
-- Name: TABLE pms_room_types; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pms_room_types TO anon;
GRANT ALL ON TABLE public.pms_room_types TO authenticated;
GRANT ALL ON TABLE public.pms_room_types TO service_role;


--
-- Name: TABLE pms_rooms; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pms_rooms TO anon;
GRANT ALL ON TABLE public.pms_rooms TO authenticated;
GRANT ALL ON TABLE public.pms_rooms TO service_role;


--
-- Name: TABLE pos_order_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pos_order_items TO anon;
GRANT ALL ON TABLE public.pos_order_items TO authenticated;
GRANT ALL ON TABLE public.pos_order_items TO service_role;


--
-- Name: TABLE pos_orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pos_orders TO anon;
GRANT ALL ON TABLE public.pos_orders TO authenticated;
GRANT ALL ON TABLE public.pos_orders TO service_role;


--
-- Name: TABLE pos_payments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pos_payments TO anon;
GRANT ALL ON TABLE public.pos_payments TO authenticated;
GRANT ALL ON TABLE public.pos_payments TO service_role;


--
-- Name: TABLE pos_sessions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pos_sessions TO anon;
GRANT ALL ON TABLE public.pos_sessions TO authenticated;
GRANT ALL ON TABLE public.pos_sessions TO service_role;


--
-- Name: TABLE restaurant_addons; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.restaurant_addons TO anon;
GRANT ALL ON TABLE public.restaurant_addons TO authenticated;
GRANT ALL ON TABLE public.restaurant_addons TO service_role;


--
-- Name: TABLE restaurant_delivery_tiers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.restaurant_delivery_tiers TO anon;
GRANT ALL ON TABLE public.restaurant_delivery_tiers TO authenticated;
GRANT ALL ON TABLE public.restaurant_delivery_tiers TO service_role;


--
-- Name: TABLE restaurant_drivers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.restaurant_drivers TO anon;
GRANT ALL ON TABLE public.restaurant_drivers TO authenticated;
GRANT ALL ON TABLE public.restaurant_drivers TO service_role;


--
-- Name: TABLE restaurant_employees; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.restaurant_employees TO anon;
GRANT ALL ON TABLE public.restaurant_employees TO authenticated;
GRANT ALL ON TABLE public.restaurant_employees TO service_role;


--
-- Name: TABLE restaurant_fast_delivery_tiers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.restaurant_fast_delivery_tiers TO anon;
GRANT ALL ON TABLE public.restaurant_fast_delivery_tiers TO authenticated;
GRANT ALL ON TABLE public.restaurant_fast_delivery_tiers TO service_role;


--
-- Name: TABLE restaurant_locations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.restaurant_locations TO anon;
GRANT ALL ON TABLE public.restaurant_locations TO authenticated;
GRANT ALL ON TABLE public.restaurant_locations TO service_role;


--
-- Name: TABLE restaurant_ratings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.restaurant_ratings TO anon;
GRANT ALL ON TABLE public.restaurant_ratings TO authenticated;
GRANT ALL ON TABLE public.restaurant_ratings TO service_role;


--
-- Name: TABLE restaurant_stock_sync; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.restaurant_stock_sync TO anon;
GRANT ALL ON TABLE public.restaurant_stock_sync TO authenticated;
GRANT ALL ON TABLE public.restaurant_stock_sync TO service_role;


--
-- Name: TABLE restaurant_subscriptions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.restaurant_subscriptions TO anon;
GRANT ALL ON TABLE public.restaurant_subscriptions TO authenticated;
GRANT ALL ON TABLE public.restaurant_subscriptions TO service_role;


--
-- Name: TABLE restaurants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.restaurants TO anon;
GRANT ALL ON TABLE public.restaurants TO authenticated;
GRANT ALL ON TABLE public.restaurants TO service_role;


--
-- Name: TABLE retail_daily_closes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.retail_daily_closes TO anon;
GRANT ALL ON TABLE public.retail_daily_closes TO authenticated;
GRANT ALL ON TABLE public.retail_daily_closes TO service_role;


--
-- Name: TABLE stock_sync_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.stock_sync_events TO anon;
GRANT ALL ON TABLE public.stock_sync_events TO authenticated;
GRANT ALL ON TABLE public.stock_sync_events TO service_role;


--
-- Name: TABLE subscription_plans; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.subscription_plans TO anon;
GRANT ALL ON TABLE public.subscription_plans TO authenticated;
GRANT ALL ON TABLE public.subscription_plans TO service_role;


--
-- Name: TABLE subscription_reminder_log; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.subscription_reminder_log TO anon;
GRANT ALL ON TABLE public.subscription_reminder_log TO authenticated;
GRANT ALL ON TABLE public.subscription_reminder_log TO service_role;


--
-- Name: TABLE suppliers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.suppliers TO anon;
GRANT ALL ON TABLE public.suppliers TO authenticated;
GRANT ALL ON TABLE public.suppliers TO service_role;


--
-- Name: TABLE table_reservations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.table_reservations TO anon;
GRANT ALL ON TABLE public.table_reservations TO authenticated;
GRANT ALL ON TABLE public.table_reservations TO service_role;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE messages_2026_08_04; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_08_04 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_08_04 TO dashboard_user;


--
-- Name: TABLE messages_2026_08_05; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_08_05 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_08_05 TO dashboard_user;


--
-- Name: TABLE messages_2026_08_06; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_08_06 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_08_06 TO dashboard_user;


--
-- Name: TABLE messages_2026_08_07; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_08_07 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_08_07 TO dashboard_user;


--
-- Name: TABLE messages_2026_08_08; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_08_08 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_08_08 TO dashboard_user;


--
-- Name: TABLE messages_2026_08_09; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_08_09 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_08_09 TO dashboard_user;


--
-- Name: TABLE messages_2026_08_10; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_08_10 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_08_10 TO dashboard_user;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.buckets FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.objects FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: ensure_rls; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER ensure_rls ON ddl_command_end
         WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
   EXECUTE FUNCTION public.rls_auto_enable();


ALTER EVENT TRIGGER ensure_rls OWNER TO postgres;

--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict hNLTmfTdY7bhsWPVK6KjYJQIdSBUpc3LZBapCqn8GO8YINqjWiamWoNXBJrNmTq

