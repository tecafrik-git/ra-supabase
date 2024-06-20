create table "public"."companies" (
    "id" bigint generated by default as identity not null,
    "name" character varying not null,
    "logo" character varying not null,
    "sector" character varying not null,
    "size" smallint not null,
    "linkedIn" character varying not null,
    "website" character varying not null,
    "phone_number" character varying not null,
    "address" character varying not null,
    "zipcode" character varying not null,
    "city" character varying not null,
    "stateAbbr" character varying not null,
    "sales_id" bigint not null,
    "created_at" timestamp without time zone not null
);


create table "public"."contactNotes" (
    "id" bigint generated by default as identity not null,
    "date" timestamp with time zone not null default now(),
    "text" character varying not null,
    "sales_id" bigint not null,
    "status" character varying not null,
    "contact_id" bigint
);


create table "public"."contacts" (
    "id" bigint generated by default as identity not null,
    "first_name" character varying not null,
    "last_name" character varying not null,
    "gender" character varying not null,
    "title" character varying not null,
    "company_id" bigint not null,
    "email" character varying not null,
    "phone_number1" character varying not null,
    "phone_number2" character varying not null,
    "background" character varying not null,
    "acquisition" character varying not null,
    "avatar" character varying null,
    "first_seen" timestamp without time zone not null,
    "last_seen" timestamp without time zone not null,
    "has_newsletter" boolean not null,
    "status" character varying not null,
    "tags" bigint[] not null,
    "sales_id" bigint not null,
    "nb_notes" smallint not null default 0
);


create table "public"."dealNotes" (
    "id" bigint generated by default as identity not null,
    "date" timestamp with time zone not null default now(),
    "deal_id" bigint not null,
    "sales_id" bigint not null,
    "type" character varying not null,
    "text" character varying not null
);


create table "public"."deals" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp without time zone not null,
    "name" character varying not null,
    "company_id" bigint not null,
    "contact_ids" bigint[] not null,
    "type" character varying not null,
    "stage" character varying not null,
    "description" character varying not null,
    "amount" bigint not null,
    "updated_at" timestamp without time zone not null,
    "start_at" timestamp without time zone not null,
    "sales_id" bigint not null,
    "index" bigint not null,
    "nb_notes" smallint not null default 0
);


create table "public"."sales" (
    "id" bigint generated by default as identity not null,
    "first_name" character varying not null,
    "last_name" character varying not null,
    "email" character varying not null
);


create table "public"."tags" (
    "id" bigint generated by default as identity not null,
    "name" character varying not null,
    "color" character varying not null
);


create table "public"."tasks" (
    "id" bigint generated by default as identity not null,
    "due_date" timestamp with time zone,
    "contact_id" bigint,
    "sales_id" bigint,
    "text" character varying,
    "type" character varying,
    "done_date" timestamp with time zone
);


CREATE UNIQUE INDEX companies_pkey ON public.companies USING btree (id);

CREATE UNIQUE INDEX "contactNotes_pkey" ON public."contactNotes" USING btree (id);

CREATE UNIQUE INDEX contacts_pkey ON public.contacts USING btree (id);

CREATE UNIQUE INDEX "dealNotes_pkey" ON public."dealNotes" USING btree (id);

CREATE UNIQUE INDEX deals_pkey ON public.deals USING btree (id);

CREATE UNIQUE INDEX sales_pkey ON public.sales USING btree (id);

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

CREATE UNIQUE INDEX tasks_pkey ON public.tasks USING btree (id);

alter table "public"."companies" add constraint "companies_pkey" PRIMARY KEY using index "companies_pkey";

alter table "public"."contactNotes" add constraint "contactNotes_pkey" PRIMARY KEY using index "contactNotes_pkey";

alter table "public"."contacts" add constraint "contacts_pkey" PRIMARY KEY using index "contacts_pkey";

alter table "public"."dealNotes" add constraint "dealNotes_pkey" PRIMARY KEY using index "dealNotes_pkey";

alter table "public"."deals" add constraint "deals_pkey" PRIMARY KEY using index "deals_pkey";

alter table "public"."sales" add constraint "sales_pkey" PRIMARY KEY using index "sales_pkey";

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."tasks" add constraint "tasks_pkey" PRIMARY KEY using index "tasks_pkey";

alter table "public"."companies" add constraint "companies_sales_id_fkey" FOREIGN KEY (sales_id) REFERENCES sales(id) not valid;

alter table "public"."companies" validate constraint "companies_sales_id_fkey";

alter table "public"."contactNotes" add constraint "contactNotes_contact_id_fkey" FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE not valid;

alter table "public"."contactNotes" validate constraint "contactNotes_contact_id_fkey";

alter table "public"."contactNotes" add constraint "contactNotes_sales_id_fkey" FOREIGN KEY (sales_id) REFERENCES sales(id) ON DELETE CASCADE not valid;

alter table "public"."contactNotes" validate constraint "contactNotes_sales_id_fkey";

alter table "public"."contacts" add constraint "contacts_company_id_fkey" FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE not valid;

alter table "public"."contacts" validate constraint "contacts_company_id_fkey";

alter table "public"."contacts" add constraint "contacts_sales_id_fkey" FOREIGN KEY (sales_id) REFERENCES sales(id) not valid;

alter table "public"."contacts" validate constraint "contacts_sales_id_fkey";

alter table "public"."dealNotes" add constraint "dealNotes_deal_id_fkey" FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE not valid;

alter table "public"."dealNotes" validate constraint "dealNotes_deal_id_fkey";

alter table "public"."dealNotes" add constraint "dealNotes_sales_id_fkey" FOREIGN KEY (sales_id) REFERENCES sales(id) not valid;

alter table "public"."dealNotes" validate constraint "dealNotes_sales_id_fkey";

alter table "public"."deals" add constraint "deals_company_id_fkey" FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE not valid;

alter table "public"."deals" validate constraint "deals_company_id_fkey";

alter table "public"."deals" add constraint "deals_sales_id_fkey" FOREIGN KEY (sales_id) REFERENCES sales(id) not valid;

alter table "public"."deals" validate constraint "deals_sales_id_fkey";

alter table "public"."tasks" add constraint "tasks_contact_id_fkey" FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_contact_id_fkey";

alter table "public"."tasks" add constraint "tasks_sales_id_fkey" FOREIGN KEY (sales_id) REFERENCES sales(id) not valid;

alter table "public"."tasks" validate constraint "tasks_sales_id_fkey";


