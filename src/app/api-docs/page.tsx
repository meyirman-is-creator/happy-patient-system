"use client";

import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

interface SwaggerSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, any>;
  components?: Record<string, any>;
}

export default function ApiDocs() {
  const [spec, setSpec] = useState<SwaggerSpec | null>(null);

  useEffect(() => {
    fetch("/api/docs")
      .then((response) => response.json())
      .then((data) => setSpec(data));
  }, []);

  if (!spec) {
    return <div>Loading API documentation...</div>;
  }

  return <SwaggerUI spec={spec} />;
}
