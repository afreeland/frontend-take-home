import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { debounce } from "@mui/material/utils";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

import { Search, SearchIconWrapper, StyledInputBase } from "components/Search";
import urls from "utils/urls";
import { useCallback, useMemo, useRef, useState } from "react";
import useLazyFetch from "hooks/useFetch";
import { PackageResult } from "types/package";
import {
  Alert,
  AlertTitle,
  Checkbox,
  Chip,
  createTheme,
  Divider,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  ThemeProvider,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ErrorIcon from "@mui/icons-material/Error";
import BugReportIcon from "@mui/icons-material/BugReport";
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { PackageLinks } from "./types/package";

const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

const ICONS = {
  bug: <BugReportIcon />,
  homepage: <HomeIcon />,
  npm: <InventoryIcon />,
  repository: <AccountTreeIcon />,
} as { [k: string]: any };

export default function SearchAppBar() {
  const [mode, setMode] = React.useState<"light" | "dark">("light");
  const { state, fetchUrl } = useLazyFetch<PackageResult[]>();
  const inputRef = useRef(null);
  const [searchOptions, setSearchOptions] = useState({
    pageSize: 25,
  });

  const handleChange = useCallback(
    (e: any) => {
      const searchTerm = e.target.value;
      if (!searchTerm) {
        return;
      }
      fetchUrl(
        urls.search.suggestions({
          q: searchTerm,
          size: searchOptions.pageSize,
        }),
        { method: "GET" }
      );
    },
    [fetchUrl, searchOptions.pageSize]
  );

  const debouncedHandler = debounce(handleChange, 350);

  const failedRequest = useCallback(() => {
    fetchUrl(
      urls.search.suggestions({
        q: "http_method",
        size: searchOptions.pageSize,
      }),
      { method: "POST" }
    );
  }, [fetchUrl, searchOptions.pageSize]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  console.log("render", state);
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                Gremlin
              </Typography>
              <Search sx={{ flexGrow: 1 }}>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search NPM packages"
                  inputProps={{ "aria-label": "search" }}
                  sx={{ width: "100%" }}
                  onChange={debouncedHandler}
                  ref={inputRef}
                />
              </Search>
              <IconButton
                sx={{ ml: 1 }}
                onClick={colorMode.toggleColorMode}
                color="inherit"
              >
                {theme.palette.mode === "dark" ? (
                  <Brightness7Icon />
                ) : (
                  <Brightness4Icon />
                )}
              </IconButton>
              <Checkbox
                icon={<ErrorOutlineIcon color="action" />}
                checkedIcon={<ErrorIcon color="error" />}
                onChange={() => {
                  failedRequest();
                }}
              />
            </Toolbar>
          </AppBar>
          {state.loading && (
            <List sx={{ width: "100%" }}>
              {[...new Array(10)].map((_, idx) => {
                return (
                  <ListItem alignItems="flex-start" sx={{ margin: "20px 0" }}>
                    <Skeleton
                      animation="wave"
                      variant="circular"
                      width={40}
                      height={40}
                    />
                    <Box flexDirection="row" flex="1" marginLeft={2}>
                      <Skeleton animation="wave" height={20} width="80%" />
                      <Skeleton animation="wave" height={20} width="60%" />
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          )}
          {state.error && (
            <Alert severity="error">
              <AlertTitle>Error</AlertTitle>
              The following error occurred:{" "}
              <strong>{state.error?.message}</strong>
            </Alert>
          )}
          {state.data !== undefined && (
            <List sx={{ width: "100%", bgcolor: "background.paper" }}>
              {state.data.map((result) => {
                return (
                  <>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Link
                            href={result.package.links.npm}
                            target="_blank"
                            aria-label={`Link to ${result.package.name}`}
                          >
                            {result.package.name} @ {result.package.version}
                          </Link>
                        }
                        secondary={
                          <React.Fragment>
                            {result.package.description}
                            <Box marginTop={2}>
                              {Object.keys(
                                result.package.links as PackageLinks
                              ).map((current, idx) => (
                                <Chip
                                  icon={ICONS[current]}
                                  label={current}
                                  size="small"
                                  sx={{
                                    margin: idx === 0 ? undefined : "0 10px",
                                  }}
                                />
                              ))}
                            </Box>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </>
                );
              })}
            </List>
          )}
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
