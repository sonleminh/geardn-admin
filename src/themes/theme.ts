import { createTheme } from "@mui/material";

export const theme = ()=> createTheme({
    palette: {
        primary: {
            main: '#000',
            light: '#fff'
        },
    },
    components: {
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
        // MuiFilledInput: {
        //     styleOverrides: {
        //         root: {
        //             minHeight: 48,
        //         }
        //     }
        // }
    }
   ,
    // components: {
    //       MuiMenuItem: {
    //         styleOverrides: {
    //           root: {
    //             background: 'transparent',
    //             transition: 'all .2s',
      
    //             '&:hover, &:active, &.active, &.Mui-selected': {
    //                 color: 'red',
    //                 background: 'green'
    //             },
    //             '&.Mui-selected:hover': {
    //                 background: 'green'
    //             }
    //           }
    //         }
    //       },
    //       MuiListItem: {
    //         styleOverrides: {
    //           root: {
    //             color: 'pink',
    //             '&.MuiButtonBase-root': {
    //                 color: '#fff',
      
    //               '&:hover': {
    //                 color: 'red',
    //                 background: 'green'
    //               }
    //             }
    //           }
    //         }
    //       },
    // }
    
})