import React, { createContext, useContext, useState, useEffect } from "react";
import { getTopHeadlines, getCategory, getSearch } from "../api/gnews";
import { useNavigate } from "react-router-dom";

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyNumber, setKeyNumber] = useState(0);
  const keyList = [
    "VITE_GNEWS_0",
    "VITE_GNEWS_1",
    "VITE_GNEWS_2",
    "VITE_GNEWS_3",
  ];
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const dateToDuration = (date) => {
    let currentDate = new Date().getTime();
    let articleDate = new Date(date).getTime();
    let duration = new Date(currentDate - articleDate);
    let minutesAgo = duration / 1000 / 60;
    return minutesAgo;
  };

  const search = (evt) => {
    if (evt.keyCode == 13) {
      getSearchData(evt.target.value);
      navigate(`/search/${evt.target.value}`);
    }
  };

  const getCategoryData = (category) => {
    setLoading(true);
    getCategory({
      country: "us",
      category: category.toLowerCase(),
      apiKey: import.meta.env[keyList[keyNumber]],
    })
      .then((res) => {
        let articleList = res.data.articles;
        for (let articleIdx in res.data.articles) {
          articleList[articleIdx].duration = dateToDuration(
            articleList[articleIdx].publishedAt
          );
        }
        setArticles(res.data.articles);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response.status == 403) {
          if (keyNumber == 3) {
            setKeyNumber(0);
            getCategoryData();
          } else {
            setKeyNumber(keyNumber + 1);
            getCategoryData();
          }
        }
      });
  };

  const getTopHeadlineData = () => {
    setLoading(true);
    getTopHeadlines({
      country: "us",
      apiKey: import.meta.env[keyList[keyNumber]],
    })
      .then((res) => {
        let articleList = res.data.articles;
        console.log(articleList);
        for (let articleIdx in res.data.articles) {
          articleList[articleIdx].duration = dateToDuration(
            articleList[articleIdx].publishedAt
          );
        }
        setArticles(articleList);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response.status == 403) {
          if (keyNumber == 3) {
            setKeyNumber(0);
            getTopHeadlineData();
          } else {
            setKeyNumber(keyNumber + 1);
            getTopHeadlineData();
          }
        }
      });
  };

  const getSearchData = (searchQuery) => {
    setLoading(true);
    getSearch({
      country: "us",
      q: searchQuery,
      apiKey: import.meta.env[keyList[keyNumber]],
    })
      .then((res) => {
        let articleList = res.data.articles;
        for (let articleIdx in res.data.articles) {
          articleList[articleIdx].duration = dateToDuration(
            articleList[articleIdx].publishedAt
          );
        }
        setArticles(res.data.articles);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response.status == 403) {
          if (keyNumber == 3) {
            setKeyNumber(0);
            getSearchData();
          } else {
            setKeyNumber(keyNumber + 1);
            getSearchData();
          }
        }
      });
  };

  return (
    <StoreContext.Provider
      value={{
        screenWidth,
        search,
        articles,
        loading,
        setLoading,
        getCategoryData,
        getTopHeadlineData,
        getSearchData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
