import * as yup from 'yup'

interface FileWithMimeType {
    type: string;
}

export const createSchema = yup.object({
    title: yup.string().required('Nội dung này không được để trống!').max(490, 'Không được vượt quá 490 ký tự!')
    , tags: yup.array().of(
        yup.object().shape({
        value: yup.string().required('Value is required'),
        label: yup.string().required('Label is required'),
      })).required('Nội dung này không được để trống!').min(1, 'Nội dung này không được để trống!')
    , summary: yup.string().required('Nội dung này không được để trống!')
    , content: yup.string().required('Nội dung này không được để trống!')
    , thumbnail_image: yup.mixed().required('Nội dung này không được để trống!').test('fileFormat', 'Chọn file ảnh hợp lệ jpg/jpeg/png', (value)=> {
        if (value) {
            const file = value as FileWithMimeType;
            return ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type);
        }
        return true;
    })
})

export const updateSchema = yup.object({
    title: yup.string().required('Nội dung này không được để trống!').max(490, 'Không được vượt quá 490 ký tự!')
    , tags: yup.array().of(
        yup.object().shape({
        value: yup.string().required('Value is required'),
        label: yup.string().required('Label is required'),
      })).required('Nội dung này không được để trống!').min(1, 'Nội dung này không được để trống!')
    , summary: yup.string().required('Nội dung này không được để trống!')
    , content: yup.string().required('Nội dung này không được để trống!')
    , thumbnail_image: yup.mixed().test('fileFormat', 'Chọn file ảnh hợp lệ jpg/jpeg/png', (value)=> {
        if (value) {
            const file = value as FileWithMimeType;
            return ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type);
        }
        return true;
    })
})