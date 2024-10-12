import * as yup from 'yup'

export const createSchema = yup.object({
    name: yup.string().required('Nội dung này không được để trống!').max(100, 'Không được vượt quá 100 ký tự!'),
    category: yup.string().required('Nội dung này không được để trống!'),
    tags: yup.array().max(3, 'Nhập tối đa 3 tag!'),
    attributes: yup.array().max(3, 'Nhập tối đa 3 phân loại!'),
    sku_name: yup.string().required('Nội dung này không được để trống!').max(20, 'Không được vượt quá 20 ký tự!'),
    images: yup.array().min(1,'Ảnh không được để trống!').max(3, 'Sản phẩm yêu cầu tối đa 3 ảnh!'),
    brand: yup.string().max(20, 'Không được vượt quá 20 ký tự!'),
    details: yup.object().shape({
        guarantee: yup
          .string()
          .max(20, 'Độ dài tối đa là 20 ký tự!'),
          weight: yup
          .string()
          .max(20, 'Độ dài tối đa là 20 ký tự!'),
          material: yup
          .string()
          .max(20, 'Độ dài tối đa là 20 ký tự!'),
    }),
    description: yup.string().required('Nội dung này không được để trống!')
})

export const updateSchema = yup.object({
    name: yup.string().required('Nội dung này không được để trống!').max(100, 'Không được vượt quá 100 ký tự!'),
    category: yup.string().required('Nội dung này không được để trống!'),
    tags: yup.array().max(3, 'Nhập tối đa 3 tag!'),
    attributes: yup.array().max(3, 'Nhập tối đa 3 phân loại!'),
    sku_name: yup.string().required('Nội dung này không được để trống!').max(20, 'Không được vượt quá 20 ký tự!'),
    images: yup.array().min(1,'Ảnh không được để trống!').max(3, 'Sản phẩm yêu cầu tối đa 3 ảnh!'),
    brand: yup.string().max(20, 'Không được vượt quá 20 ký tự!'),
    details: yup.object().shape({
        guarantee: yup
          .string()
          .max(20, 'Độ dài tối đa là 20 ký tự!'),
          weight: yup
          .string()
          .max(20, 'Độ dài tối đa là 20 ký tự!'),
          material: yup
          .string()
          .max(20, 'Độ dài tối đa là 20 ký tự!'),
    }),
    description: yup.string().required('Nội dung này không được để trống!')
})