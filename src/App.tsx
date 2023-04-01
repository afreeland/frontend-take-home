import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { debounce } from "@mui/material/utils";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";

import { Search, SearchIconWrapper, StyledInputBase } from "components/Search";
import urls from "utils/urls";
import { useCallback, useMemo, useRef, useState } from "react";
import useLazyFetch from "hooks/useFetch";
import { PackageResult } from "types/package";
import {
  Alert,
  AlertTitle,
  Link,
  List,
  ListItem,
  ListItemText,
  Skeleton,
} from "@mui/material";
export default function SearchAppBar() {
  const { state, fetchUrl } = useLazyFetch<PackageResult[]>();
  const [searchOptions, setSearchOptions] = useState({
    pageSize: 25,
  });

  const handleChange = useCallback(
    (e: any) => {
      const searchTerm = e.target.value;
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

  return (
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
            />
          </Search>
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
          The following error occurred: <strong>{state.error?.message}</strong>
        </Alert>
      )}
      {state.data !== undefined && (
        <List sx={{ width: "100%", bgcolor: "background.paper" }}>
          {state.data.map((result) => {
            return (
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Link
                      href={result.package.links.npm}
                      target="_blank"
                      aria-label={`Link to ${result.package.name}`}
                    >
                      {result.package.name}
                    </Link>
                  }
                  secondary={result.package.description}
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
}
