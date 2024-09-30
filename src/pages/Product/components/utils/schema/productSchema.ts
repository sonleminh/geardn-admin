import * as yup from 'yup'

interface FileWithMimeType {
    type: string;
}

export const createSchema = yup.object({
    name: yup.string().required('Nội dung này không được để trống!').max(490, 'Không được vượt quá 490 ký tự!'),
    price: yup.number().required('Giá tiền không được để trống!').min(1000, 'Giá tiền không được nhỏ hơn 1.000 VNĐ!')
    , tags: yup.array().of(
        yup.object().shape({
        value: yup.string().required('Value is required'),
        label: yup.string().required('Label is required'),
      })).required('Nội dung này không được để trống!').min(1, 'Nội dung này không được để trống!')
    , category: yup.string().required('Nội dung này không được để trống!')
    , content: yup.string().required('Nội dung này không được để trống!')
    , images: yup.array().min(1,'Nội dung này không được để trống!').max(3, 'Sản phẩm yêu cầu tối đa 3 ảnh!')
})

export const updateSchema = yup.object({
    name: yup.string().required('Nội dung này không được để trống!').max(490, 'Không được vượt quá 490 ký tự!')
    , tags: yup.array().of(
        yup.object().shape({
        value: yup.string().required('Value is required'),
        label: yup.string().required('Label is required'),
      })).required('Nội dung này không được để trống!').min(1, 'Nội dung này không được để trống!')
    , category: yup.string().required('Nội dung này không được để trống!')
    , content: yup.string().required('Nội dung này không được để trống!')
    , images: yup.mixed().test('fileFormat', 'Chọn file ảnh hợp lệ jpg/jpeg/png', (value)=> {
        if (value) {
            const file = value as FileWithMimeType;
            return ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type);
        }
        return true;
    })
})