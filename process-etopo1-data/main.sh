#!/bin/sh

# ----------------------
# PARAMETERS
# ----------------------

# levels (in meter)
startLevel=-10000
endLevel=9000

# desired resolution between levels in meter
resolution=20

# our iterator variable
currentLevel="$startLevel"

# available ETOPO1 variantes
etopo1_bed="ETOPO1_Bed_g"
etopo1_ice="ETOPO1_Ice_g"

# either etopo1_bed or etopo1_ice
etopo1_variant=$etopo1_bed

# folders
folder_base="./data"
folder_temp="./temp"
folder_out=$folder_base"/levels"
folder_in=$folder_base"/ETOPO1"

# Create these directorys if they don't exist
mkdir -p $folder_base
mkdir -p $folder_temp
mkdir -p $folder_out
mkdir -p $folder_in

# files
geotiff_in=$folder_in/$etopo1_variant"_geotiff.tif"
geotiff_cropped=$folder_in/$etopo1_variant"_crop.tif"
zip_in=$folder_in/$etopo1_variant"_geotiff.zip"

# download urls
download_url_ice="https://www.ngdc.noaa.gov/mgg/global/relief/ETOPO1/data/ice_surface/grid_registered/georeferenced_tiff/ETOPO1_Ice_g_geotiff.zip"
download_url_bed="https://www.ngdc.noaa.gov/mgg/global/relief/ETOPO1/data/bedrock/grid_registered/georeferenced_tiff/ETOPO1_Bed_g_geotiff.zip"
download_url=$download_url_ice && [[ $etopo1_variant == $etopo1_bed ]]  && download_url=$download_url_bed


# number of parallel processes
# defines how many levels are processed at the same time
# could be lower or higher, depending on computer
PARALLEL_PROCESSES=8


# ----------------------
# ENTRY POINT
# ----------------------

main () {
    dataPreprocessing
    levelGeneration
}


# ----------------------
# LEVEL GENERATION
# ----------------------

# loops over levels
levelGeneration () {
    # generate array with levels
    levels=()
    # run as long as we are less or equal endLevel
    while [ "$currentLevel" -le "$endLevel" ]
    do
        levels+=("$currentLevel")
        currentLevel=$(( currentLevel+resolution ))
    done

    (
    for level in "${levels[@]}"
    do
        ((i=i%PARALLEL_PROCESSES)); ((i++==0)) && wait
        processSingleLevel "$level" &
    done
    )

}

# processes single levels
processSingleLevel () {
    local currentLevelLocal=$1

    if [ ! -f "$folder_out"/"$currentLevelLocal".geojson ]
    then
        # some echoing so we know where we are in the process
        echo "Level $currentLevelLocal — START"

        # calc geotiff for current height
        echo "Level $currentLevelLocal — Generating GeoTiff"
        gdal_calc.py -A "$geotiff_cropped" --outfile="$folder_temp"/level"$currentLevelLocal".tif --calc="A>=$currentLevelLocal" --NoDataValue=0

        # echo "Level $currentLevelLocal — Polygonize"
        # create polygon-shapefile of current level from geotiff
        gdal_polygonize.py "$folder_temp"/level"$currentLevelLocal".tif -f "ESRI Shapefile" "$folder_temp"/level"$currentLevelLocal".shp level"$currentLevelLocal" elev

        echo "Level $currentLevelLocal — Generating GeoJSON"
        # transform shapefile to geojson
        ogr2ogr -f GeoJSON "$folder_out"/"$currentLevelLocal".geojson "$folder_temp"/level"$currentLevelLocal".shp

        echo "Level $currentLevelLocal — Deleting temp"
        # remove temporary files for current level
        rm "$folder_temp"/level"$currentLevelLocal"*

        echo "Level $currentLevelLocal — FINISHED"

    else
        echo "Level $currentLevelLocal — SKIP (Already exists)"
    fi
}


# ----------------------
# DATA PREPROCESSING
# ----------------------

# entry point for the data preprocessing
# checks if cropped geotiff exists
dataPreprocessing () {
    if [ -f "$geotiff_cropped" ]
    then
        # yes
        echo "Cropped geotiff exists. Moving on to level generation…"
    else
        # no > generate it
        checkForOriginalGeotiff
    fi
}

# check if original geotiff exists
checkForOriginalGeotiff () {
    echo "Cropped Geotiff does not exist."
    if [ -f "$geotiff_in" ]
        then
            # yes > crop it
            cropOriginalGeotiff
        else
            # no > check if zip archive exists
            checkForOriginalZip
    fi
}

# crops the input geotiff
cropOriginalGeotiff () {
    gdal_translate -projwin -180.0 90.0 180.0 -90.0 "$geotiff_in" "$geotiff_cropped"
    echo "Generated cropped geotiff from original."
}

# unzips the input archive
unzipOriginalZip () {
    unzip "$zip_in" -d $folder_in
    echo "Unzipped geodata."
}

# checks if the input archive is present
checkForOriginalZip () {
    echo "Original Geotiff does not exist. Checking if zip archive exists…"
    if [ -f "$zip_in" ]
    then
        # exists > unzip archive
        unzipOriginalZip
    else
        # does not exist > download it
        downloadOriginalZip
    fi
    checkForOriginalGeotiff
}

# downloads zip from NOAA
downloadOriginalZip () {
    echo "Zip File with geodata does not exist. Downloading it…"
    curl --output $zip_in $download_url
}


# ----------------------
# RUN MAIN
# ----------------------

main
