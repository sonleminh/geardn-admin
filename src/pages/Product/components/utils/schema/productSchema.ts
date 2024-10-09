import * as yup from 'yup'

export const createSchema = yup.object({
    name: yup.string().required('Nội dung này không được để trống!').max(490, 'Không được vượt quá 490 ký tự!'),
    price: yup.number().required('Giá tiền không được để trống!').min(1000, 'Giá tiền không được nhỏ hơn 1.000 VNĐ!')
    , category: yup.string().required('Nội dung này không được để trống!')
    , content: yup.string().required('Nội dung này không được để trống!')
    , images: yup.array().min(1,'Ảnh không được để trống!').max(3, 'Sản phẩm yêu cầu tối đa 3 ảnh!')
})

export const updateSchema = yup.object({
    name: yup.string().required('Nội dung này không được để trống!').max(490, 'Không được vượt quá 490 ký tự!')
    , category: yup.string().required('Nội dung này không được để trống!')
    , content: yup.string().required('Nội dung này không được để trống!')
    , images: yup.array().min(1,'Ảnh không được để trống!').max(3, 'Sản phẩm yêu cầu tối đa 3 ảnh!')
})