import { useHttp } from 'utils/http';
import { Project } from 'screens/project-list/list';
import { QueryKey, useMutation, useQuery } from 'react-query';
import {
  useAddConfig,
  useDeleteConfig,
  useEditConfig,
} from './use-optimistic-options';

export const useProjects = (param?: Partial<Project>) => {
  const client = useHttp();
  return useQuery<Project[], Error>(['projects', param], () =>
    client('projects', { data: param })
  );
};

export const useEditProject = (queryKey: QueryKey) => {
  const client = useHttp();
  return useMutation(
    (params: Partial<Project>) =>
      client(`projects/${params.id}`, {
        method: 'PATCH',
        data: params,
      }),
    useEditConfig(queryKey)
  );
};

export const useAddProject = (queryKey: QueryKey) => {
  const client = useHttp();
  return useMutation(
    (params: Partial<Project>) =>
      client(`projects`, {
        method: 'post',
        data: params,
      }),
    useAddConfig(queryKey)
  );
};

export const useDeleteProject = (queryKey: QueryKey) => {
  const client = useHttp();
  return useMutation(
    ({ id }: { id: number }) =>
      client(`projects/${id}`, {
        method: 'DELETE',
      }),
    useDeleteConfig(queryKey)
  );
};
