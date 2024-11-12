import React, { useState } from "react";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import AspectRatio from "@mui/joy/AspectRatio";
import CardOverflow from "@mui/joy/CardOverflow";
import Divider from "@mui/joy/Divider";
import Skeleton from "@mui/joy/Skeleton";
import { Box } from "@mui/joy";

import style from "../../styles/modules/SmallArticleCard.module.scss";
const SmallArticleCard = (props) => {
  return (
    <>
      <Card variant="outlined">
        <CardOverflow>
          <AspectRatio ratio="2">
            <Skeleton loading={props.loading} variant="overlay">
              <img src={props.articleImage} loading="lazy" alt="No Image" />
            </Skeleton>
          </AspectRatio>
        </CardOverflow>

        <CardContent>
          <Typography level="title-md">
            <Skeleton loading={props.loading}>
              <a
                className={style.links}
                href={props.articleLink}
                target="_blank"
              >
                {props.articleTitle}
              </a>
            </Skeleton>
          </Typography>
        </CardContent>
        <CardOverflow variant="soft" sx={{ bgcolor: "background.level1" }}>
          <Divider inset="context" />
          <CardContent className={style.cardFooter} orientation="horizontal">
            <div style={{ display: "flex" }}>
              <img
                style={{ marginRight: "10px" }}
                src={`https://s2.googleusercontent.com/s2/favicons?domain_url=${
                  props.articleSource.url
                }&sz=${20}`}
              />
              <Typography
                level="body-xs"
                fontWeight="md"
                textColor="text.secondary"
              >
                <Skeleton loading={props.loading}>
                  <a className={style.links} href={props.articleSource.url}>
                    {props.articleSource.name}
                  </a>
                </Skeleton>
              </Typography>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Divider
                sx={{ width: "1px", height: "auto", marginRight: "15px" }}
                orientation="vertical"
              />
              <Typography
                level="body-xs"
                fontWeight="md"
                textColor="text.secondary"
              >
                <Skeleton loading={props.loading}>
                  {props.publishedDuration / 60 < 1
                    ? `${props.publishedDuration} minutes ago`
                    : `${Math.floor(props.publishedDuration / 60)} 
                      ${
                        Math.floor(props.publishedDuration / 60) == 1
                          ? "hour ago"
                          : "hours ago"
                      }`}
                </Skeleton>
              </Typography>
            </div>
          </CardContent>
        </CardOverflow>
      </Card>
    </>
  );
};

export default SmallArticleCard;
