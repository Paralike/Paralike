---
title: "Human Facial Recognition"
date: 2020-05-01
lastmod: 2023-08-02
draft: false
project_tags: [""]
status: "growing"
weight: 2
summary: "Emotion recognition"
links:
    external_link:
        text: "Github link (In Hungarian)"
        icon: "fab alt brands fa-github"
        href: "https://github.com/Paralike/Human-Facial-Recognition"
        weight: 1
---
## Abstract

In this report, I would like to present the experiences I gained during the task of developing an emotion categorization system based on facial expressions. Throughout the development process, I explored several areas that were previously unfamiliar to me. As a result, I gained a broader understanding of various classification architectures and their peculiarities. I worked with four classification models, achieving varying levels of success. Additionally, I gained insights into determining the accuracy and reliability of each model, enabling us to select the most suitable model for a given task and situation.

## Introduction
In recent times, machine learning has undergone revolutionary advancements, leading to the emergence of increasingly better architectures. But have these advancements truly resulted in improvements? Can a machine surpass human knowledge? In the following pages, I seek to answer these questions in a subject that often challenges even the capacities of the human brain: predicting a person's emotional state based on facial expressions.

## Used Architectures
Image classification has been a developing field for quite some time, resulting in numerous useful and functional solutions. In this project, I dealt with three main types of architectures.

### VGG-based architectures
At the beginning of the task, my first idea was to construct a VGG-based architecture. I chose this approach based on initial articles and web pages, as it was theoretically expected to yield the best results [1].

### VGG16
As a result, with the help of various articles [2], I managed to implement my very first neural network, VGG16. However, challenges arose at this point. It became apparent that merely setting up the model was not enough. Acquiring the training dataset proved to be the most laborious task. Different image collections stored data in various formats and often did not use the same categories. As a solution, I chose three datasets: [3][4][5]. Additionally, there were three more datasets available to me, but they were not evenly distributed. Some datasets contained only two categories, such as "happy" and "neutral." I omitted these images from the training database to ensure a more balanced distribution of classes. Consequently, I collected 29,220 training images and 3,534 validation images, which I divided into seven classes: "happy," "angry," "sad," "disgusted," "neutral," "surprised," and "afraid." As the number of images was relatively low compared to an MNIST dataset, I performed further data augmentation. With these preparations, the training could begin. Unfortunately, the training of this model proved to be unsuccessful as, no matter how much I reduced the batch size, the network did not fit into the memory of my graphics card.

### Modified VGG
Following this, optimizing memory usage became a central issue, and the transformation of VGG16 began. As a first step, I attempted to increase the dropout rate, decrease the batch size, and introduce checkpoints to reduce memory usage, but these measures proved to be insufficient. Therefore, I had no choice but to reduce the number of parameters. I achieved this by removing the fifth convolutional layer and the third fully connected layer, as well as decreasing the number of filters as follows: [32, 64, 128, 256]. By successfully implementing these changes, the number of parameters decreased from 20,897,286 to 1,328,102. With these adjustments, the training dataset finally fit into my graphics card's memory.

However, I encountered another issue as the learning algorithm refused to learn properly. Despite training for 10 epochs, there was no improvement in learning accuracy after the first epoch. I found a possible solution to this problem in the following article [6], which led me to assume that the images with different appearances might be causing the issue.

As visible in the comparison, the first image shows a much closer view of the face than the second one. Consequently, the feature maps were unable to learn distinct facial expressions. To test this hypothesis, I removed the JAFFE dataset from the training set.