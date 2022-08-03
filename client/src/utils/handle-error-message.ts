import { AxiosError } from 'axios'

export type ResponseErrorData = {
  error?: string
  message?: string | string[]
}

export const handleErrorMessage = (
  error: AxiosError<ResponseErrorData>,
  onEachError: (data: ResponseErrorData) => void,
) => {
  if (typeof error.response?.data.message === 'string') {
    onEachError({
      error: error.response?.data.error,
      message: error.response?.data.message,
    })
  } else {
    error.response?.data.message?.forEach((errorMessage) => {
      onEachError({
        error: error.response?.data.error,
        message: errorMessage,
      })
    })
  }
}
