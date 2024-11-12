import React, { useState, useRef, useEffect } from "react";
import {
  Sheet,
  Input,
  Avatar,
  Box,
  Select,
  Option,
  IconButton,
  Button,
  Typography,
} from "@mui/joy";
import { Link } from "react-router-dom";
import { countryList } from "./lib/country.js";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsIcon from "@mui/icons-material/Settings";
import { useStore } from "../store/store.jsx";
import { useNavigate } from "react-router-dom";

import { ModeToggle } from "../App.jsx";

import style from "../styles/modules/Navbar.module.scss";
const Navbar = () => {
  const store = useStore();
  const navigate = useNavigate();
  // const [showSetting, setShowSetting] = useState(false);
  const [countries, setCountries] = useState(countryList);
  const settingRef = useRef(null);

  const handleCountryChange = (evt, value) => {
    store.setCountry(value);
  };

  useEffect(() => {
    console.log("I RAN");
    navigate("/");
    store.getTopHeadlineData();
  }, [store.country]);

  // const toggleSettings = () => {
  //   setShowSetting(!showSetting);
  // };

  // useEffect(() => {
  //   const handleClickOutside = (e) => {
  //     if (settingRef.current && !settingRef.current.contains(e.target)) {
  //       setShowSetting(false);
  //     }
  //   };
  //   document.addEventListener("mousedown", handleClickOutside);

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  // const handleSelectClick = (event) => {
  //   event.stopPropagation(); // Prevent event bubbling for the select element
  // };

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
            <Select
              defaultValue="us"
              onChange={handleCountryChange}
              size="sm"
              variant="plain"
            >
              {countries.map((country, idx) => {
                return (
                  <Option key={idx} value={country.value}>
                    {country.name}
                  </Option>
                );
              })}
            </Select>
            {/* <div style={{ position: "relative" }}>
              <IconButton variant="plain">
                <SettingsIcon onClick={toggleSettings} />
              </IconButton>
              {showSetting && (
                <Sheet
                  ref={settingRef}
                  sx={{
                    position: "absolute",
                    boxShadow: "0px 5px 13px #636874",
                  }}
                  variant="soft"
                  className={style.settingsContainer}
                >
                  <Box className={style.setting_1}>
                    <Typography>Region: </Typography>
                    <Select
                      onMouseDown={handleSelectClick}
                      size="sm"
                      variant="plain"
                      defaultValue="en"
                    >
                      {countries.map((country, idx) => {
                        return (
                          <Option key={idx} value={country.value}>
                            {country.name}
                          </Option>
                        );
                      })}
                    </Select>
                  </Box>
                  <Box className={style.setting_1}>
                    <Typography>Language: </Typography>
                    <Select size="sm" variant="plain" defaultValue="en">
                      <Option value="en">en</Option>
                      <Option value="zh">zh</Option>
                    </Select>
                  </Box>

                  <Button size="sm" className={style.saveSettingBtn}>
                    Save
                  </Button>
                </Sheet>
              )}
            </div> */}
            <ModeToggle />
            {/* <Avatar variant="outlined">SK</Avatar> */}
          </div>
        </Box>
      </Sheet>
    </>
  );
};

export default Navbar;
