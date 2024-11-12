import React, { createContext, useContext, useState, useEffect } from "react";
import { getTopHeadlines, getCategory, getSearch } from "../api/gnews";
import { useNavigate } from "react-router-dom";

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("us");

  let keyNum = 0;
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
      country: country,
      category: category.toLowerCase(),
      apiKey: import.meta.env[keyList[keyNum]],
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
        if (err.response.status == 403 || err.response.status == 400) {
          if (keyNum == 3) {
            keyNum = 0;
            getCategoryData(category);
          } else {
            keyNum++;
            getCategoryData(category);
          }
        }
      });
  };

  const getTopHeadlineData = () => {
    setLoading(true);
    getTopHeadlines({
      country: country,
      apiKey: import.meta.env[keyList[keyNum]],
    })
      .then((res) => {
        let articleList = res.data.articles;
        for (let articleIdx in res.data.articles) {
          articleList[articleIdx].duration = dateToDuration(
            articleList[articleIdx].publishedAt
          );
        }
        setArticles(articleList);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response.status == 403 || err.response.status == 400) {
          if (keyNum == 3) {
            keyNum = 0;
            getTopHeadlineData();
          } else {
            keyNum++;
            getTopHeadlineData();
          }
        }
      });
  };

  const getSearchData = (searchQuery) => {
    setLoading(true);
    getSearch({
      country: country,
      q: searchQuery,
      apiKey: import.meta.env[keyList[keyNum]],
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
        if (err.response.status == 403 || err.response.status == 400) {
          if (keyNum == 3) {
            keyNum = 0;
            getSearchData(searchQuery);
          } else {
            keyNum++;
            getSearchData(searchQuery);
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
        country,
        setCountry,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
