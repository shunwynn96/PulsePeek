import React from "react";
import {
  Card,
  CardCover,
  CardContent,
  Typography,
  Button,
  Sheet,
  Skeleton,
} from "@mui/joy";
import LaunchIcon from "@mui/icons-material/Launch";

import { useStore } from "../../store/store";

import style from "../../styles/modules/HeadlineCard.module.scss";
const HeadlineCard = (props) => {
  const store = useStore();

  return (
    <>
      <Card sx={{ height: "276px", width: "100%" }}>
        <CardCover>
          <Skeleton loading={props.loading} variant="overlay">
            <img src={props.articleImage} loading="lazy" alt="article image" />
          </Skeleton>
        </CardCover>
        <CardCover
          sx={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0) 200px), linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0) 300px)",
          }}
        />
        <CardContent sx={{ justifyContent: "flex-end" }}>
          <Typography level="title-lg" textColor="#fff">
            <Skeleton loading={props.loading}>{props.articleTitle}</Skeleton>
          </Typography>
          <Typography
            style={{ display: "flex", alignItems: "center" }}
            textColor="neutral.300"
          >
            <Skeleton loading={props.loading}>
              <img
                style={{ marginRight: "10px", marginTop: "5px" }}
                src={`https://s2.googleusercontent.com/s2/favicons?domain_url=${
                  props.articleSource.url
                }&sz=${20}`}
              />
              <a className={style.links} href={props.articleSource.url}>
                {props.articleSource.name}
              </a>
            </Skeleton>
          </Typography>
        </CardContent>
      </Card>
      {store.screenWidth > 1100 && (
        <Sheet variant="soft" className={style.description}>
          <Typography>
            <Skeleton loading={props.loading}>
              {props.articleContent.split("...", 1)}...
            </Skeleton>
          </Typography>

          <Button
            className={style.linkButton}
            variant="soft"
            endDecorator={<LaunchIcon />}
            color="primary"
          >
            <Skeleton loading={props.loading}>
              <a href={props.articleLink} target="_blank">
                Continue Reading
              </a>
            </Skeleton>
          </Button>
        </Sheet>
      )}
    </>
  );
};

export default HeadlineCard;
