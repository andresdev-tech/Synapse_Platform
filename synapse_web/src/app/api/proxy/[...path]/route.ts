import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_BACKEND_URL || "http://127.0.0.1:4000/api";

async function proxyHandler(req: NextRequest, context: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  try {
    const rawParams = context?.params;
    const resolvedParams = rawParams instanceof Promise ? await rawParams : rawParams;
    const pathList = Array.isArray(resolvedParams?.path) ? resolvedParams.path : [];
    const subPath = pathList.join("/");
    
    const url = new URL(req.url);
    const search = url.search;

    const targetUrl = `${BACKEND_URL}/${subPath}${search}`;

    const forwardHeaders = new Headers();
    req.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!["host", "connection", "content-length"].includes(lower)) {
        forwardHeaders.set(key, value);
      }
    });

    const isBodyAllowed = req.method !== "GET" && req.method !== "HEAD";
    const body = isBodyAllowed ? await req.blob() : undefined;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    const responseData = await response.arrayBuffer();

    return new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("[Next.js Proxy Handler Error]", error.message);
    return NextResponse.json(
      { error: "No se pudo comunicar con el Backend", details: error.message },
      { status: 502 }
    );
  }
}

export {
  proxyHandler as GET,
  proxyHandler as POST,
  proxyHandler as PUT,
  proxyHandler as DELETE,
  proxyHandler as PATCH,
  proxyHandler as OPTIONS
};
