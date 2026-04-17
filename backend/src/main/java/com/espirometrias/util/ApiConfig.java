package com.espirometrias.util;

public class ApiConfig {

    private static final String COMMON_PATH = "/esp-IA-api";

    private static final String API_VERSION_V1 = "/v1";
    private static final String API_BASE_PATH_V1 = COMMON_PATH + API_VERSION_V1;

    public static final String API_BASE_PATH = API_BASE_PATH_V1;

    private ApiConfig() {
        throw new UnsupportedOperationException("This class should never be instantiated");
    }
}