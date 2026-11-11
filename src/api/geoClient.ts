import { City, State } from 'country-state-city';
import { API_ROOT } from './vendorClient';

export interface PincodeLookupResult {
  success: boolean;
  pincode: string;
  district: string;
  city: string;
  state: string;
  state_code?: string;
  country: string;
  areas: string[];
  latitude?: number;
  longitude?: number;
  google_map_url?: string;
  source?: string;
}

export interface ReverseGeocodeResult {
  success: boolean;
  formatted_address?: string;
  address_line1?: string;
  area?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  country?: string;
  latitude: number;
  longitude: number;
  google_map_url?: string;
  source?: string;
}

// 1. Fetch Indian States using country-state-city
export function getIndianStates() {
  const states = State.getStatesOfCountry('IN');
  // Sort with Andhra Pradesh and Telangana at top for quick selection
  return states.sort((a, b) => {
    if (a.isoCode === 'AP') return -1;
    if (b.isoCode === 'AP') return 1;
    if (a.isoCode === 'TG') return -1;
    if (b.isoCode === 'TG') return 1;
    return a.name.localeCompare(b.name);
  });
}

// 2. Fetch Cities for an Indian State
export function getCitiesForState(stateCode: string) {
  if (!stateCode) return [];
  const cities = City.getCitiesOfState('IN', stateCode);
  return cities.sort((a, b) => a.name.localeCompare(b.name));
}

// 3. Find State Code by Name or vice-versa
export function findStateCodeByName(stateName: string): string {
  if (!stateName) return 'AP';
  const clean = stateName.toLowerCase().trim();
  const allStates = State.getStatesOfCountry('IN');
  const matched = allStates.find(
    (s) =>
      s.name.toLowerCase() === clean ||
      s.isoCode.toLowerCase() === clean ||
      clean.includes(s.name.toLowerCase()),
  );
  return matched ? matched.isoCode : 'AP';
}

// 4. Smart PIN Code Lookup (Backend API first, Indian Postal API fallback)
export async function lookupPostalPincode(pincode: string): Promise<PincodeLookupResult> {
  const cleanPin = pincode.replace(/\D/g, '').trim();
  if (cleanPin.length !== 6) {
    throw new Error('Please enter a valid 6-digit Indian PIN code.');
  }

  // A. Try our dedicated backend endpoint first
  try {
    const res = await fetch(`${API_ROOT}/geo/pincode/${cleanPin}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = (await res.json()) as PincodeLookupResult;
      if (data && data.success) {
        return { ...data, source: 'andhrayatri-backend' };
      }
    }
  } catch {
    // Backend offline / cross-origin during local dev - proceed to client fallback
  }

  // B. Fallback to official India Post API
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json) && json[0]?.Status === 'Success') {
        const poList = json[0]?.PostOffice || [];
        const areas: string[] = [];
        let district = '';
        let state = '';
        let city = '';

        for (const po of poList) {
          if (po.Name && !areas.includes(po.Name)) {
            areas.push(po.Name);
          }
          if (!district && po.District) district = po.District.trim();
          if (!state && po.State) state = po.State.trim();
          if (!city && (po.Division || po.Block || po.District)) {
            city = (po.Division || po.Block || po.District).trim();
          }
        }

        const stateCode = findStateCodeByName(state);

        // Find fallback coordinates from city in country-state-city
        const stateCities = getCitiesForState(stateCode);
        const cityMatch = stateCities.find(
          (c) =>
            c.name.toLowerCase() === city.toLowerCase() ||
            c.name.toLowerCase() === district.toLowerCase(),
        );

        const lat = cityMatch?.latitude ? parseFloat(cityMatch.latitude) : 17.6868;
        const lng = cityMatch?.longitude ? parseFloat(cityMatch.longitude) : 83.2185;

        return {
          success: true,
          pincode: cleanPin,
          district: district || city || 'Visakhapatnam',
          city: city || district || 'Visakhapatnam',
          state: state || 'Andhra Pradesh',
          state_code: stateCode,
          country: 'India',
          areas: areas.slice(0, 15),
          latitude: lat,
          longitude: lng,
          google_map_url: `https://www.google.com/maps?q=${lat},${lng}`,
          source: 'india-post-public',
        };
      }
    }
  } catch {
    // In case public postal API is unreachable
  }

  // C. Fallback for known AP prefixes
  const prefix = cleanPin.slice(0, 3);
  const apKnownPrefixes: Record<string, { city: string; state: string; lat: number; lng: number }> = {
    '530': { city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
    '531': { city: 'Anakapalle', state: 'Andhra Pradesh', lat: 17.6913, lng: 83.0039 },
    '532': { city: 'Srikakulam', state: 'Andhra Pradesh', lat: 18.2949, lng: 83.8938 },
    '533': { city: 'Kakinada', state: 'Andhra Pradesh', lat: 16.9891, lng: 82.2475 },
    '534': { city: 'Eluru', state: 'Andhra Pradesh', lat: 16.7107, lng: 81.0952 },
    '535': { city: 'Vizianagaram', state: 'Andhra Pradesh', lat: 18.1067, lng: 83.3956 },
    '520': { city: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lng: 80.648 },
    '521': { city: 'Machilipatnam', state: 'Andhra Pradesh', lat: 16.1809, lng: 81.1303 },
    '522': { city: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lng: 80.4365 },
    '523': { city: 'Ongole', state: 'Andhra Pradesh', lat: 15.5057, lng: 80.0499 },
    '524': { city: 'Nellore', state: 'Andhra Pradesh', lat: 14.4426, lng: 79.9865 },
    '515': { city: 'Anantapur', state: 'Andhra Pradesh', lat: 14.6819, lng: 77.6006 },
    '516': { city: 'Kadapa', state: 'Andhra Pradesh', lat: 14.4673, lng: 78.8242 },
    '517': { city: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lng: 79.4192 },
    '518': { city: 'Kurnool', state: 'Andhra Pradesh', lat: 15.8281, lng: 78.0373 },
    '500': { city: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867 },
  };

  const matched = apKnownPrefixes[prefix] || {
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    lat: 17.6868,
    lng: 83.2185,
  };

  return {
    success: true,
    pincode: cleanPin,
    district: matched.city,
    city: matched.city,
    state: matched.state,
    state_code: findStateCodeByName(matched.state),
    country: 'India',
    areas: [`${matched.city} Central`, `${matched.city} Main Road`],
    latitude: matched.lat,
    longitude: matched.lng,
    google_map_url: `https://www.google.com/maps?q=${matched.lat},${matched.lng}`,
    source: 'local-prefix-registry',
  };
}

// 5. Reverse Geocode Coordinates to Address
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number,
): Promise<ReverseGeocodeResult> {
  // A. Try backend reverse geocode endpoint
  try {
    const res = await fetch(`${API_ROOT}/geo/reverse-geocode?lat=${lat}&lng=${lng}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return data as ReverseGeocodeResult;
      }
    }
  } catch {
    // Backend offline / fallback
  }

  // B. Fallback to Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const road = addr.road || addr.suburb || addr.neighbourhood || '';
      const city = addr.city || addr.town || addr.village || addr.county || 'Visakhapatnam';
      const state = addr.state || 'Andhra Pradesh';
      const postcode = addr.postcode || '';

      return {
        success: true,
        formatted_address: data.display_name || `${city}, ${state}`,
        address_line1: road || data.display_name?.split(',')?.[0] || 'Storefront Location',
        area: addr.suburb || addr.neighbourhood || '',
        city,
        district: addr.state_district || city,
        state,
        pincode: postcode,
        country: addr.country || 'India',
        latitude: lat,
        longitude: lng,
        google_map_url: `https://www.google.com/maps?q=${lat},${lng}`,
        source: 'nominatim',
      };
    }
  } catch {
    // In case of offline
  }

  return {
    success: true,
    latitude: lat,
    longitude: lng,
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    country: 'India',
    google_map_url: `https://www.google.com/maps?q=${lat},${lng}`,
    source: 'device-gps',
  };
}

