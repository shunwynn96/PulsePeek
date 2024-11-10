import React from "react";
import { Sheet, Input, Avatar, Box } from "@mui/joy";
import { Link } from "react-router-dom";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useStore } from "../store/store.jsx";

import { ModeToggle } from "../App.jsx";

import style from "../styles/modules/Navbar.module.scss";
const Navbar = () => {
  const store = useStore();

  return (
    <>
      <Sheet variant="soft" className={style.navbarContainer}>
        <Box className={style.navbar}>
          <Link onClick={store.getTopHeadlineData} to={"/"}>
            <p className={style.appTitle}>PulsePeek</p>
          </Link>
          {store.screenWidth > 700 && (
            <div>
              <Input
                size="md"
                placeholder="Search..."
                sx={{ maxWidth: "350px" }}
                variant="plain"
                onKeyDown={store.search}
                startDecorator={<SearchRoundedIcon />}
              />
            </div>
          )}

          <div style={{ display: "flex", gap: "20px" }}>
            <ModeToggle />
            {/* <Avatar variant="outlined">SK</Avatar> */}
          </div>
        </Box>
      </Sheet>
    </>
  );
};

export default Navbar;
