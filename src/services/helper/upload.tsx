import { createFormData } from '@/utils/createFormdata';
import { postRequest } from '../axios';
import { useMutation } from '@tanstack/react-query';

const uploadUrl = 'upload';

const adminUploadImage = async (payload: { image: File }) => {
  const formData = createFormData(payload);
  const result = await postRequest(`${uploadUrl}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return result.data as { path: string };
};

export const useAdminUploadImage = () => {
  return useMutation({ mutationFn: adminUploadImage, retry: 0 });
};
