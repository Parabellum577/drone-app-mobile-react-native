import React, { useEffect, useRef } from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_PLACES_API_KEY } from "@env";
import { COLORS, SPACING } from "../../constants/theme";

type Props = {
  value: string;
  onLocationSelect: (location: string) => void;
  placeholder?: string;
  listPosition?: 'absolute' | 'relative';
};

export const LocationInput: React.FC<Props> = ({
  value,
  onLocationSelect,
  placeholder = "Enter location",
  listPosition = 'relative'
}) => {
  const ref = useRef<any>();

  useEffect(() => {
    if (value && ref.current) {
      ref.current.setAddressText(value);
    }
  }, [value]);

  return (
    <GooglePlacesAutocomplete
      ref={ref}
      placeholder={placeholder}
      onPress={(data, details = null) => {
        const location = data.description;
        onLocationSelect(location);
      }}
      query={{
        key: GOOGLE_PLACES_API_KEY,
        language: "en",
        types: "(cities)",
      }}
      styles={{
        container: {
          flex: 0,
        },
        textInput: {
          backgroundColor: "white",
          borderRadius: 12,
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm + 2,
          fontSize: 16,
          color: COLORS.text,
          minHeight: 48,
          borderWidth: 1,
          borderColor: COLORS.border,
        },
        listView: {
          ...(listPosition === 'absolute' ? {
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
          } : {}),
          backgroundColor: "white",
          borderRadius: 8,
          marginTop: 4,
          elevation: 3,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        row: {
          padding: SPACING.sm,
        },
        description: {
          color: COLORS.text,
        },
      }}
      fetchDetails={true}
      enablePoweredByContainer={false}
      onFail={(error) => console.error("Error:", error)}
    />
  );
};
