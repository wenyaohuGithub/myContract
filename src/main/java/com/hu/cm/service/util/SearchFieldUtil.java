package com.hu.cm.service.util;

import java.util.HashMap;
import java.util.Map;

public final class SearchFieldUtil {
    public static Map<String, String> parseSearchField(String searchString) {
        Map<String, String> fields = new HashMap<>();

        if(searchString == null || searchString.length() == 0) {
            return fields;
        }

        String array[] = searchString.split(";");
        if(array.length == 0) {
            return fields;
        } else {
            for (String str : array) {
                String namevalue[] = str.split(":");
                fields.put(namevalue[0], namevalue[1]);
            }
        }
        return fields;
    }
}
