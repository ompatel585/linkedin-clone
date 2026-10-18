import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { del, get, patch, post } from "../../lib/api";
import { AUTH_KEY } from "../../hooks/useAuth";

export const jobKeys = {
    all: ["jobs"],
    list: (filters) => ["jobs", "list", filters],
    detail: (id) => ["jobs", "detail", id],
    saved: ["jobs", "saved"],
    mine: ["jobs", "mine"],
    applied: ["jobs", "applied"],
    applicants: (id) => ["jobs", "applicants", id],
};

const clean = (filters) => Object.fromEntries(Object.entries(filters).filter(([, value]) => value));

export const useJobs = (filters) =>
    useQuery({
        queryKey: jobKeys.list(clean(filters)),
        queryFn: () => get("/jobs", clean(filters)),
        placeholderData: keepPreviousData,
    });

export const useJob = (id) => useQuery({ queryKey: jobKeys.detail(id), queryFn: () => get(`/jobs/${id}`), enabled: Boolean(id) });
export const useSavedJobs = () => useQuery({ queryKey: jobKeys.saved, queryFn: () => get("/jobs/saved") });
export const useMyJobs = () => useQuery({ queryKey: jobKeys.mine, queryFn: () => get("/jobs/mine") });
export const useAppliedJobs = () => useQuery({ queryKey: jobKeys.applied, queryFn: () => get("/jobs/applied") });
export const useApplicants = (id) => useQuery({ queryKey: jobKeys.applicants(id), queryFn: () => get(`/jobs/${id}/applicants`) });

const useJobMutation = (mutationFn, onSuccess) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn,
        onSuccess: (data, vars) => {
            queryClient.invalidateQueries({ queryKey: jobKeys.all });
            onSuccess?.(queryClient, data, vars);
        },
    });
};

export const useCreateJob = () => useJobMutation((data) => post("/jobs", data));
export const useUpdateJob = () => useJobMutation(({ id, ...data }) => patch(`/jobs/${id}`, data));
export const useDeleteJob = () => useJobMutation((id) => del(`/jobs/${id}`));
export const useApplyToJob = () => useJobMutation(({ id, ...data }) => post(`/jobs/${id}/apply`, data));
export const useWithdrawApplication = () => useJobMutation((id) => del(`/jobs/${id}/apply`));
export const useUpdateApplicationStatus = () =>
    useJobMutation(({ jobId, applicationId, status }) => patch(`/jobs/${jobId}/applicants/${applicationId}`, { status }));

export const useToggleSaveJob = () =>
    useJobMutation(
        (id) => post(`/jobs/${id}/save`),
        (queryClient, { saved }, id) =>
            queryClient.setQueryData(AUTH_KEY, (user) =>
                user && { ...user, savedJobs: saved ? [...user.savedJobs, id] : user.savedJobs.filter((j) => j !== id) }
            )
    );
