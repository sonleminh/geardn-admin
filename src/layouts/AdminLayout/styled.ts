import { Box, styled } from "@mui/material";

export const DrawerMenuWrapper = styled(Box)(
    ({ theme }) => `
    .MuiList-root {
        .MuiListItem-root {
            padding: 0;
            margin: 8px 0;
            color: #fff;
            .MuiButtonBase-root {
                &.active {
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
                color: #fff;
            }
        }
    }
`
);