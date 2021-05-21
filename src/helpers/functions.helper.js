import { response } from "express";

const responseObjectBuilder = (
  res = response,
  code = 501,
  isOk = false,
  message = "Not defined",
  moreInfo = "",
  data = {}
) => {
  return res.status(code).json({
    ok: isOk,
    message,
    moreInfo,
    body: {
      data,
    },
  });
};

export default responseObjectBuilder;
