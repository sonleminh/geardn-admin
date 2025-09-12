import { createTheme } from "@mui/material";

export const theme = ()=> createTheme({
    palette: {
        primary: {
            main: '#000',
            light: '#fff'
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: '#f3f3f3',
              },
            },
          },
        MuiButtonBase: {
            styleOverrides: {
                root: {
                    '&.MuiButton-contained': {
                        '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.8)'
                        }
                    }
                }
            }
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    minHeight: 48,
                }
            }
        },
        MuiFilledInput: {
            styleOverrides: {
                root: {
                    backgroundColor: '#fff',
                    border: '1px solid rgba(0,0,0,0.23)',
                    borderRadius: 1,
                    '&:hover:not(.Mui-disabled)': {
                        backgroundColor: 'transparent',
                      },
                    '&.Mui-focused': {
                        backgroundColor: 'transparent',
                        border: '2px solid',
                    },
                }
            }
        },
        MuiInputLabel: {
            styleOverrides: {
                asterisk: {
                    color: 'red',
                }
            }
        },
    }
   ,
})