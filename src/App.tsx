import { useEffect, useState } from "react";
import { CSVDownloadButton } from "./components/CSVDownloadButton";
import { MarkerTable } from "./components/MarkerTable";
import { PlotlyChart } from "./components/PlotlyChart/PlotlyChart";
import RangeSlider from "./components/RangeSlider";
import { ShareButton } from "./components/ShareButton";
import LeafletMap from "./components/LeafletMap/LeafletMap";
import { ITimeseries, IMarker } from "./types";
import { useSearchParams } from "react-router-dom";
import {
  getStateFromUrlParams,
  setIntervalDaysInUrlParams,
} from "./utils/searchParamUtilities";
import { getTimeseries } from "./getTimeseries/getTimeseries";
import { NumberOfFilteredPts } from "./components/NumberOfFilteredPts";

function App() {
  const [timeseriesArr, setTimeseriesArr] = useState<Array<ITimeseries>>([]);
  const [params, setSearchParams] = useSearchParams();
  const initialState = getStateFromUrlParams(params);
  const [markers, setMarkers] = useState<Array<IMarker>>(initialState.markers);
  const [intervalDays, setIntervalDays] = useState<Array<number>>(
    initialState.intervalDays
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // cleanup for race conditions
    let ignore = false;

    // filter stale timeseries by markers
    const filteredTimeseries = timeseriesArr.filter(
      (timeseries) => !markers.every((m) => m.id !== timeseries.marker.id)
    );
    setTimeseriesArr(filteredTimeseries.slice());

    const newMarkers = markers.filter((marker) =>
      timeseriesArr.every((timeseries) => timeseries.marker.id !== marker.id)
    );

    if (newMarkers.length > 0) {
      setIsLoading(true);
      newMarkers.map(getTimeseries).map((promise) =>
        promise
          .then((timeseries) => {
            if (ignore) return;
            setTimeseriesArr((arr) => [...arr, timeseries]);
            setIsLoading(false);
          })
          .catch((err) => {
            console.error(err);
            setIsLoading(false);
          })
      );
    }
    return () => {
      ignore = true;
    };
  }, [markers]);

  return (
    <div id="root" className="w-full h-screen">
      <div className="w-full h-[55%] shadow-md">
        <LeafletMap
          markers={markers}
          setMarkers={setMarkers}
          setSearchParams={setSearchParams}
          zoom={initialState.mapZoom}
        />
      </div>
      <div className="h-[45%] flex py-4 flex-col lg:flex-row items-center">
        <div className="w-[90%] h-full min-h-[300px] border-[#e5e7eb] border-2 overflow-hidden rounded-lg mx-4 shadow-md mb-4 lg:mb-0">
          <PlotlyChart
            loading={isLoading}
            timeseriesArr={timeseriesArr}
            intervalDays={intervalDays}
            plotBounds={initialState.plotBounds}
            setSearchParams={setSearchParams}
          />
        </div>
        <div className="max-w-[400px] w-full h-full  mx-4 flex flex-col items-center">
          <div className="h-[166px] w-full">
            <MarkerTable
              markers={markers}
              setMarkers={setMarkers}
              setSearchParams={setSearchParams}
              setTimeseriesArr={setTimeseriesArr}
            />
          </div>

          <div className="w-full mt-4 shadow-md border-[#e5e7eb] border-2 rounded-lg p-4 overflow-auto min-h-[160px]">
            <div className="flex flex-col items-center mx-4">
              <div className="w-full flex flex-row items-center justify-between">
                <div className="text-md font-semibold">
                  Measurement Interval (days)
                </div>
                <NumberOfFilteredPts
                  timeseriesArr={timeseriesArr}
                  intervalDays={intervalDays}
                />
              </div>
              <RangeSlider
                className="w-[100%] h-10 mt-2 mb-2"
                defaultValue={intervalDays}
                min={1}
                max={500}
                onAfterChange={(value) => {
                  setIntervalDays(value);
                  setSearchParams(
                    (prevParams) =>
                      setIntervalDaysInUrlParams(prevParams, value),
                    { replace: true }
                  );
                }}
              />
            </div>
            <div className="flex justify-between">
              <div className="mr-4">
                <CSVDownloadButton data={timeseriesArr} />
              </div>
              <ShareButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;
