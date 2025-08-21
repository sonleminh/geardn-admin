import { Box, styled } from "@mui/material";

export const DrawerMenuWrapper = styled(Box)(
    () => `
    .MuiList-root > {
        .MuiListItem-root {
            padding: 0;
            margin: 8px 0;
            color: #fff;
            .MuiButtonBase-root {
                &.active,
                &:hover {
                    background-color: #333;
                    color: #fff;
                }
                .MuiListItemIcon-root {
                    color: #fff;
                }
            }
        },
        .MuiCollapse-root {
            .MuiListItem-root {
                padding: 0;
                margin: 8px 0;
                color: #fff;
                .MuiListItemIcon-root {
                    color: #fff;
                },
                .MuiButtonBase-root {
                    padding-left: 36px;
                    &.active,
                    &:hover {
                        background-color: #333;
                        color: #fff;
                    }
                }
            }
        }
    }
`
);