import * as React from 'react';
import type { ReactNode } from 'react';
import { useAPISchema } from 'ra-supabase-core';
import {
    useResourceContext,
    Loading,
    ListBase,
    ListView,
    InferredElement,
    listFieldTypes,
    editFieldTypes,
} from 'react-admin';
import type { ListProps, ListViewProps } from 'react-admin';
import { capitalize, singularize } from 'inflection';

import { inferElementFromType } from './inferElementFromType';

export const ListGuesser = (props: ListProps & { enableLog?: boolean }) => {
    const {
        debounce,
        disableAuthentication,
        disableSyncWithLocation,
        exporter,
        filter,
        filterDefaultValues,
        perPage,
        queryOptions,
        resource,
        sort,
        storeKey,
        ...rest
    } = props;
    return (
        <ListBase
            debounce={debounce}
            disableAuthentication={disableAuthentication}
            disableSyncWithLocation={disableSyncWithLocation}
            exporter={exporter}
            filter={filter}
            filterDefaultValues={filterDefaultValues}
            perPage={perPage}
            queryOptions={queryOptions}
            resource={resource}
            sort={sort}
            storeKey={storeKey}
        >
            <ListGuesserView {...rest} />
        </ListBase>
    );
};

export const ListGuesserView = (
    props: ListViewProps & {
        enableLog?: boolean;
    }
) => {
    const { data: schema, error, isPending } = useAPISchema();
    const resource = useResourceContext();
    const [child, setChild] = React.useState<ReactNode>(null);
    const [filters, setFilters] = React.useState<
        React.ReactElement[] | undefined
    >(undefined);
    if (!resource) {
        throw new Error('ListGuesser must be used withing a ResourceContext');
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
        if (!resourceDefinition || !resourceDefinition.properties) {
            return;
        }
        const inferredFields = Object.keys(resourceDefinition.properties).map(
            (source: string) =>
                inferElementFromType({
                    name: source,
                    types: listFieldTypes,
                    description:
                        resourceDefinition.properties![source].description,
                    format: resourceDefinition.properties![source].format,
                    type: (resourceDefinition.properties &&
                    resourceDefinition.properties[source] &&
                    typeof resourceDefinition.properties[source].type ===
                        'string'
                        ? resourceDefinition.properties![source].type
                        : 'string') as string,
                })
        );
        const inferredTable = new InferredElement(
            listFieldTypes.table,
            null,
            inferredFields
        );
        setChild(inferredTable.getElement());

        const rowFilters =
            schema!
                .paths![`/${resource}`].get!.parameters?.filter(obj =>
                    obj['$ref'].includes('rowFilter')
                )
                .map(obj => obj['$ref'].split('.').pop()) ?? [];
        const inferredInputsForFilters = rowFilters.map(source => {
            const field = resourceDefinition.properties![source];
            return inferElementFromType({
                name: source,
                types: editFieldTypes,
                description: field.description,
                format: field.format,
                type: field.type as string,
            });
        });
        if (inferredInputsForFilters.length > 0) {
            const filterElements = inferredInputsForFilters.map(inferredInput =>
                inferredInput.getElement()
            );
            setFilters(filterElements.filter(el => el != null));
        }

        if (!enableLog) return;

        const tableRepresentation = inferredTable.getRepresentation();

        const filterRepresentation =
            inferredInputsForFilters.length > 0
                ? `const filters = [
${inferredInputsForFilters
    .map(inferredInput => '    ' + inferredInput.getRepresentation())
    .join(',\n')}
];
`
                : '';

        const fieldComponents = Array.from(
            tableRepresentation.matchAll(/<([^/\s>]+)/g)
        )
            .map(match => match[1])
            .filter(component => component !== 'span');
        const filterComponents = Array.from(
            filterRepresentation.matchAll(/<([^/\s>]+)/g)
        )
            .map(match => match[1])
            .filter(component => component !== 'span');
        const components = Array.from(
            new Set(['List', ...fieldComponents, ...filterComponents])
        ).sort();

        // eslint-disable-next-line no-console
        console.log(
            `Guessed List:
            
import { ${components.join(', ')} } from 'react-admin';

${filterRepresentation}
export const ${capitalize(singularize(resource))}List = () => (
    <List${filterRepresentation ? ' filters={filters}' : ''}>
${tableRepresentation}
    </List>
);`
        );
    }, [resource, isPending, error, schema, enableLog]);

    if (isPending) return <Loading />;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <ListView filters={filters} {...rest}>
            {child}
        </ListView>
    );
};
