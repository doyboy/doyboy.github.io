import requests
import math
import os
from enum import Enum

os.system("mkdir images")

if os.path.isfile("output.txt"):
    os.remove("output.txt")

outputFile = open("output.txt", "a")
outputFile.write("Output:\n\n")
outputFile.close()

RAINDROP_ACCESS_TOKEN = "e9b35900-8edc-440d-b9ae-382d67c8a556"


def getRaindropJsonByPage(pageNum):
    requestUrl = f"https://api.raindrop.io/rest/v1/raindrops/0?access_token={RAINDROP_ACCESS_TOKEN}&page={pageNum}"

    outputFile = open("output.txt", "a")
    outputFile.write(f"current request url: {requestUrl}\n")
    outputFile.close()

    return requests.get(requestUrl).json()


def getRaindropReponseCount(response):
    return response.get("count")


def getTotalPages(itemCount):
    return math.floor(itemCount / 25)


def printToFile(list):
    for i, item in enumerate(list):
        outputFile = open("output.txt", "a")
        outputFile.write(f"For item {i}: {item}")
        outputFile.write("\n-----------------\n")
        outputFile.close()


def getEveryRaindropItem(totalPages):
    totalItems = []
    for pageNum in range(totalPages + 1):
        items = getRaindropJsonByPage(pageNum).get("items")
        totalItems.append(items)
    return totalItems


def getAllIdsFromItems(itemsArray):
    outputFile = open("output.txt", "a")

    idArray = []
    idCount = 0

    for i, items in enumerate(itemsArray):
        for item in items:
            url = item.get("link")
            outputFile.write(f"Current URL: {url}\n")
            site = url.split("/")[2]
            if site != "e621.net":
                outputFile.write(f"{site} is an invalid site, skipping\n")
            else:
                postId = url.split("/")[-1].split("?")[0]
                try:
                    postId = int(postId) + 1
                    outputFile.write(f"current e621 id being appended: {postId}\n")
                    idCount += 1
                    idArray.append(postId)
                except:
                    outputFile.write(f"{postId} is not a valid id from e621, skipping\n")
        outputFile.write(f"current total ids after page {i}: {idCount}\n")

    outputFile.close()

    return idArray


def writeImage(id):
    imageResponseUrl = f"https://e621.net/posts.json?limit=1&page=b{id}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36"
    }

    imageResponseResult = requests.get(imageResponseUrl, headers=headers).json()

    imagePost = imageResponseResult.get("posts")[0]
    imageFileUrl = imagePost.get("file").get("url")
    imageFileType = imagePost.get("file").get("ext")
    imageArtistTags = imagePost.get("tags").get("artist")
    imageArtist = ""
    speciesArray = imagePost.get("tags").get("species")
    characterSpecies = ""

    for artistTag in imageArtistTags:
        if (
            artistTag != "third-party_edit"
            and artistTag != "conditional_dnp"
            and artistTag != "sound_warning"
        ):
            imageArtist = artistTag
            break

    for species in speciesArray:
        if (
            species == "canid"
            or species == "bear"
            or species == "felid"
            or species == "bovine"
            or species == "procyonid"
            or species == "hyena"
            or species == "deer"
            or species == "dragon"
            or species == "rat"
            or species == "bat"
            or species == "human"
        ):
            characterSpecies = species
            break
        characterSpecies = species

    correctedId = id - 1

    imageFileContent = requests.get(imageFileUrl).content
    imageFile = open(
        f"images/{imageArtist}-{characterSpecies}-{correctedId}.{imageFileType}", "wb"
    )

    imageFile.write(imageFileContent)
    imageFile.close()


raindropJson = getRaindropJsonByPage(0)
raindropItems = raindropJson.get("items")

totalItemCount = getRaindropReponseCount(raindropJson)
totalPageCount = getTotalPages(totalItemCount)

itemsArray = getEveryRaindropItem(totalPageCount)

allPostIds = getAllIdsFromItems(itemsArray)

outputFile = open("output.txt", "a")
outputFile.write("\nFinal ID list:\n\n")

idCount = 0

for id in allPostIds:
    idCount += 1
    outputFile.write(f"{id}, ")

outputFile.write(f"\n\nTotal IDs: {idCount}")

outputFile.close()

for postId in allPostIds:
    writeImage(postId)