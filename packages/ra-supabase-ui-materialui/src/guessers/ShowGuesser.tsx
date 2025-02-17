import * as React from 'react';
import type { ReactNode } from 'react';
import { useAPISchema } from 'ra-supabase-core';
import {
    useResourceContext,
    Loading,
    ShowBase,
    ShowView,
    InferredElement,
    showFieldTypes,
    SelectField,
} from 'react-admin';
import type { ShowProps, ShowViewProps } from 'react-admin';
import { capitalize, singularize } from 'inflection';

import { inferElementFromType } from './inferElementFromType';

const supabaseShowFieldTypes = {
    ...showFieldTypes,
    enumeration: {
        component: SelectField,
        representation: props => `<SelectField source="${props.source}" />`,
    },
};

export const ShowGuesser = (props: ShowProps & { enableLog?: boolean }) => {
    const { id, disableAuthentication, queryOptions, resource, ...rest } =
        props;
    return (
        <ShowBase
            id={id}
            disableAuthentication={disableAuthentication}
            queryOptions={queryOptions}
            resource={resource}
        >
            <ShowGuesserView {...rest} />
        </ShowBase>
    );
};

export const ShowGuesserView = (
    props: ShowViewProps & {
        enableLog?: boolean;
    }
) => {
    const { data: schema, error, isPending } = useAPISchema();
    const resource = useResourceContext();
    const [child, setChild] = React.useState<ReactNode>(null);
    if (!resource) {
        throw new Error('ShowGuesser must be used withing a ResourceContext');
    }
    const { enableLog = process.env.NODE_ENV === 'development', ...rest } =
        props;

    React.useEffect(() => {
        if (isPending || error) {
            return;
        }
        const resourceDefinition = schema.definitions?.[resource];
        if (!resourceDefinition || !resourceDefinition.properties) {
            throw new Error(
                `The resource ${resource} is not defined in the API schema`
            );
        }
        const inferredFields = Object.keys(resourceDefinition.properties)
            .filter(
                source =>
                    resourceDefinition.properties![source].format !== 'tsvector'
            )
            .map((source: string) =>
                inferElementFromType({
                    name: source,
                    types: supabaseShowFieldTypes,
                    description:
                        resourceDefinition.properties![source].description,
                    format: resourceDefinition.properties![source].format,
                    type: (resourceDefinition.properties &&
                    resourceDefinition.properties[source] &&
                    typeof resourceDefinition.properties[source].type ===
                        'string'
                        ? resourceDefinition.properties![source].type
                        : 'string') as string,
                    propertySchema: resourceDefinition.properties![source],
                })
            );
        const inferredLayout = new InferredElement(
            showFieldTypes.show,
            null,
            inferredFields
        );
        setChild(inferredLayout.getElement());
        if (!enableLog) return;

        const representation = inferredLayout.getRepresentation();

        const components = ['Show']
            .concat(
                Array.from(
                    new Set(
                        Array.from(representation.matchAll(/<([^/\s>]+)/g))
                            .map(match => match[1])
                            .filter(component => component !== 'span')
                    )
                )
            )
            .sort();

        // eslint-disable-next-line no-console
        console.log(
            `Guessed Show:
            
import { ${components.join(', ')} } from 'react-admin';
            
export const ${capitalize(singularize(resource))}Show = () => (
    <Show>
${representation}
    </Show>
);`
        );
    }, [resource, isPending, error, schema, enableLog]);

    if (isPending) return <Loading />;
    if (error) return <p>Error: {error.message}</p>;

    return <ShowView {...rest}>{child}</ShowView>;
};
