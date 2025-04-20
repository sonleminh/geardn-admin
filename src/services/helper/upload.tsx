import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../axiosInstance';
import { createFormData } from '@/utils/createFormdata';

const uploadUrl = 'upload';

const adminUploadImage = async (payload: { image: File }) => {
  const formData = createFormData(payload);
  const result = await axiosInstance.post(`${uploadUrl}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return result.data as { path: string };
};

export const useAdminUploadImage = () => {
  return useMutation({ mutationFn: adminUploadImage, retry: 0 });
};
