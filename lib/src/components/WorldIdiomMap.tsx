import React, { useMemo, useState } from "react";
import "./WorldIdiomMap.scss";
import {
    ZoomableGroup,
    ComposableMap,
    Geographies,
    Geography
} from "react-simple-maps";
import { GetIdiomQuery_idiom, GetIdiomQuery_idiom_equivalents, GetIdiomQuery_idiom_equivalents_language_countries, GetIdiomQuery_idiom_language_countries } from "../__generated__/types";
import { CountryFlag } from "./CountryFlag";

const geoUrl = "/static/world-110m.json";

interface MapChartProps extends WorldIdiomMapProps {
    setSelectedCountry: (tooltip: SelectedCountry | null) => void;
    idiomMap: Map<string, IdiomMapInfo[]>;
}

export interface WorldIdiomMapProps {
    idiom: GetIdiomQuery_idiom;
}

type IdiomMapInfo = {
    slug: string,
    title: string,
    literalTranslation: string | null,
    languageName: string,
    country: GetIdiomQuery_idiom_equivalents_language_countries | GetIdiomQuery_idiom_language_countries
}

const MapChart: React.FunctionComponent<MapChartProps> = (props) => {

    const handleSelection = (
        event: React.MouseEvent<SVGPathElement>,
        idioms: IdiomMapInfo[] | undefined,
        countryKey: string,
        countryName: string
    ) => {
        const map = event.currentTarget.ownerSVGElement;
        if (idioms && map) {
            const bounds = map.getBoundingClientRect();
            const x = event.clientX - bounds.left;
            const y = event.clientY - bounds.top;
            props.setSelectedCountry({
                countryKey,
                countryName,
                horizontalEdge: x <= bounds.width / 2 ? "left" : "right",
                verticalEdge: y <= bounds.height / 2 ? "top" : "bottom",
                x: x <= bounds.width / 2 ? x + 12 : bounds.width - x + 12,
                y: y <= bounds.height / 2 ? y + 12 : bounds.height - y + 12
            });
        }
    }

    return (
        <>
            <ComposableMap projection="geoMercator" projectionConfig={{ scale: 135 }}>
                <ZoomableGroup>
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map(geo => {
                                const properties = geo.properties as Record<string, string>;
                                const { NAME, ISO_A2 } = properties;
                                const idioms = props.idiomMap.get(ISO_A2);
                                const hasIdioms = !!idioms;
                                return <Geography
                                    stroke="white"
                                    strokeWidth="0.8px"
                                    key={geo.rsmKey}
                                    geography={geo}
                                    aria-label={NAME}
                                    onMouseDown={(event) => {
                                        handleSelection(event, idioms, ISO_A2, NAME);
                                    }}
                                    onMouseEnter={(event) => {
                                        handleSelection(event, idioms, ISO_A2, NAME);
                                    }}
                                    onMouseMove={(event) => {
                                        handleSelection(event, idioms, ISO_A2, NAME);
                                    }}
                                    onMouseLeave={() => {
                                        props.setSelectedCountry(null);
                                    }}
                                    style={{
                                        fill: hasIdioms ? "#513b56" : "#D6D6DA",
                                        outline: "none"
                                    }}
                                />;
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>
        </>
    );
};

type SelectedCountry = {
    countryKey: string,
    countryName: string,
    horizontalEdge: "left" | "right",
    verticalEdge: "top" | "bottom",
    x: number,
    y: number
}

const WorldMap: React.FunctionComponent<WorldIdiomMapProps> = (props) => {
    const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(null);
    const idiomMap = useMemo(() => {
        const result = new Map<string, IdiomMapInfo[]>();
        ProcessIdiom(result, props.idiom);
        for (const equivalentIdiom of props.idiom.equivalents) {
            ProcessIdiom(result, equivalentIdiom);
        }
        return result;
    }, [props.idiom]);
    const newProps = { setSelectedCountry: setSelectedCountry, ...props };

    const idiom = props.idiom;

    let toolTipContent: React.ReactNode = null;
    if (selectedCountry) {
        const idioms = idiomMap.get(selectedCountry?.countryKey);
        const country = idioms ? idioms[0].country : null;
        const idiomHtml = idioms?.map(x =>
            <div key={x.slug} className="mapIdiomContainer">
                <div className="mapIdiomTitleContainer">
                    <span className="idiomLanguage">{x.languageName}: </span>
                    <span className="mapIdiomTitle">{x.title}</span>
                </div>
                <div className="mapIdiomTranslation">{x.literalTranslation}</div>
            </div>)
        toolTipContent = <div>
            <h2><CountryFlag country={country!} size={"small"} />{selectedCountry.countryName}</h2>
            {idiomHtml}
        </div>;
    }

    return (
        <div className="worldIdiomMap">
            <MapChart idiomMap={idiomMap} {...newProps} />
            {toolTipContent && selectedCountry && (
                <div
                    className="worldIdiomTooltip"
                    role="tooltip"
                    style={{
                        [selectedCountry.horizontalEdge]: selectedCountry.x,
                        [selectedCountry.verticalEdge]: selectedCountry.y
                    }}
                >
                    {toolTipContent}
                </div>
            )}
        </div>
    );
}

function ProcessIdiom(idiomMap: Map<string, IdiomMapInfo[]>, idiom: (GetIdiomQuery_idiom | GetIdiomQuery_idiom_equivalents)) {
    for (let country of idiom.language.countries) {
        let existing = idiomMap.get(country.countryKey) || [];
        const info: IdiomMapInfo = {
            title: idiom.title,
            slug: idiom.slug,
            literalTranslation: idiom.literalTranslation,
            languageName: idiom.language.languageName,
            country: country
        };
        existing.push(info);
        idiomMap.set(country.countryKey, existing);
    }
}

export default WorldMap;