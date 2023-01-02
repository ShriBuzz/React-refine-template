import React, { useMemo } from 'react';

// packages
import { useTable, ColumnDef, flexRender } from '@pankod/refine-react-table';
import {
  Box,
  List,
  Group,
  Table,
  Select,
  DateField,
  ShowButton,
  EditButton,
  ScrollArea,
  Pagination,
  DeleteButton,
} from '@pankod/refine-mantine';
import { GetManyResponse, useMany } from '@pankod/refine-core';

// components
import { ColumnFilter, ColumnSorter } from '@/components/table';

// types
import { IPost, ICategory, FilterElementProps } from './types';

export const PostList: React.FC = () => {
  const columns = useMemo<ColumnDef<IPost>[]>(
    () => [
      {
        id: 'id',
        header: 'ID',
        accessorKey: 'id',
      },
      {
        id: 'title',
        header: 'Title',
        accessorKey: 'title',
        meta: {
          filterOperator: 'contains',
        },
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        meta: {
          filterElement: function render(props: FilterElementProps) {
            return (
              <Select
                defaultValue='published'
                data={[
                  { label: 'Published', value: 'published' },
                  { label: 'Draft', value: 'draft' },
                  { label: 'Rejected', value: 'rejected' },
                ]}
                {...props}
              />
            );
          },
          filterOperator: 'eq',
        },
      },
      {
        id: 'category.id',
        header: 'Category',
        enableColumnFilter: false,
        accessorKey: 'category.id',
        cell: function render({ getValue, table }) {
          const meta = table.options.meta as {
            categoriesData: GetManyResponse<ICategory>;
          };
          const category = meta.categoriesData?.data.find(
            (item) => item.id === getValue()
          );
          return category?.title ?? 'Loading...';
        },
      },
      {
        id: 'createdAt',
        header: 'Created At',
        accessorKey: 'createdAt',
        enableColumnFilter: false,
        cell: function render({ getValue }) {
          return <DateField value={getValue() as string} format='LLL' />;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        accessorKey: 'id',
        enableColumnFilter: false,
        enableSorting: false,
        cell: function render({ getValue }) {
          return (
            <Group spacing='xs' noWrap>
              <ShowButton hideText recordItemId={getValue() as number} />
              <EditButton hideText recordItemId={getValue() as number} />
              <DeleteButton hideText recordItemId={getValue() as number} />
            </Group>
          );
        },
      },
    ],
    []
  );

  const {
    getHeaderGroups,
    getRowModel,
    setOptions,
    refineCore: {
      setCurrent,
      pageCount,
      current,
      tableQueryResult: { data: tableData },
    },
  } = useTable({
    columns,
  });

  const categoryIds = tableData?.data?.map((item) => item.category.id) ?? [];
  const { data: categoriesData } = useMany<ICategory>({
    resource: 'categories',
    ids: categoryIds,
    queryOptions: {
      enabled: categoryIds.length > 0,
    },
  });

  setOptions((prev) => ({
    ...prev,
    meta: {
      ...prev.meta,
      categoriesData,
    },
  }));

  return (
    <ScrollArea>
      <List>
        <Table verticalSpacing='sm' striped>
          <thead>
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id} className='!bg-white'>
                      {!header.isPlaceholder && (
                        <Group spacing='xs' noWrap>
                          <Box>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </Box>
                          <Group spacing='xs' noWrap>
                            <ColumnSorter column={header.column} />
                            <ColumnFilter column={header.column} />
                          </Group>
                        </Group>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
        <br />
        <Pagination
          position='right'
          total={pageCount}
          page={current}
          onChange={setCurrent}
        />
      </List>
    </ScrollArea>
  );
};
