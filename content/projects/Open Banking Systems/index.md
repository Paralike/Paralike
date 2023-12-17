---
title: "PSD 2 Based Web application For Open Banking"
date: 2020-05-01
lastmod: 2023-08-01
draft: false
project_tags: [""]
status: "evergreen"
weight: 1
summary: " "
links:
    external_link:
        text: "Github link (In Hungarian)"
        icon: "fab alt brands fa-github"
        href: "https://github.com/Paralike/AR-Oktatasi-Segedeszkoz-Meta-2-Hasznalataval"
        weight: 1
---


# Abstract
Money and financial systems always played an important role in our life. We trust our future to them. A small mistake is enough to lose our savings, but the reward is so high every company wants to join. And because of this, constant improvement is needed in the field of banking services. Moreover, banks have very important knowledge that other companies lack: our data. In the past years, the competition for our data is at an all-time high. Whoever has our data can sell it. This is why the GDPR made a huge impact in 2018. But user data is necessary for improving services, and if done right and ethically, it can result in services that are tailored to the customers' needs.

In 2015, the European Union started to map out legislation called PSD 2. It allows companies and banks to use customers' data that was not collected by them but by a different company.

During this project, I want to show the potential of this regulation and how it can change the way we handle our finances.

The basic idea of this work is not only to understand but to create an aggregate application that can connect and collect information from the biggest Hungarian banks. For this, I planned and built a web application with Angular, .NET, and SQL to handle all this information. For the main application, I used patterns, authentication flows, and external services to make my system more reliable. Besides these, I connected an ELK system for observability and monitoring purposes which can be helpful for further growth.

I hope this application can give further insight into how the modern bank system works while giving a good idea of how modern technology can harness the power of traditional systems.

# Introduction

In this essay, I'm going to introduce and overview a rather new concept called Open Banking. I'll answer questions about its importance, who is affected, and how it is implemented in the real world. Additionally, I'll write software to demonstrate the practicality of this technology. To understand this study better, I'll introduce some keywords.

## Keywords
- **PSD2:** EU Directive effective in 2019, aiming to provide more secure online banking and support Third-Party Providers (TPPs).
- **TPP:** Third Party Provider, an unaffiliated entity that performs services for a company.
- **Multibanking:** Software that enables access to data from multiple banks from one platform.
- **AISP:** Account Information Service Provider, a service provider accessing account details.
- **PISP:** Payment Initiation Service Provider, a service provider initiating and managing payments on the customer's account.
- **CISP:** Card-based Payment Issuer Service Provider, a service provider with the right to issue a card.
- **ASPSP:** Account Servicing Payment Service Provider, banks and similar companies.
- **PSU:** Payment Service User
- **SCA:** Strong Customer Authentication
- **EBA:** European Banking Authority
- **API:** Application Programming Interface, intermediary software allowing two applications to communicate.
- **KYC:** Know Your Customer
- **FAPI:** Financial-grade API
- **CIBA:** Client Initiated Backchannel Authentication
- **PPID:** Pairwise Pseudonymous Identifiers
- **REST:** Architectural constraints for distributed hypermedia systems.
- **URL:** Web address, describing where pages are located.
- **DTO:** Data Transfer Object

## Motivation
The financial field is one of the oldest systems globally, present everywhere. I aim to find ways to improve existing systems, especially considering the growing concern related to everyone's data.

## The Structure of the Paper

### 2. Chapter
In this chapter, I will provide an overview of what Open Banking is, how it works, and examine which parties this legislation affects and why it will be an improvement for them.

### 3. Chapter
I will introduce some of the most basic concepts of Open Banking and its structure. Additionally, I will investigate the security measures it provides for stable and safe transactions and introduce the basic structure of the application that can connect multiple banks.

### 4. Chapter
I will introduce the actual implementation and how I solved the tasks.

### 5. Chapter
I will show the results of the application, which uses the technology introduced in the previous chapters.

### 6. Chapter
I will summarize the results, conclude the project, and make plans for the future.

Certainly! Here's the provided text formatted in Markdown:

# Backgrounds

## Open Banking and PSD2

### Overview of Open Banking

Open banking is a technology established by the PSD2 regulation in 2016, succeeding its predecessor PSD. The main objective of this EU and UK law is to level the playing field for new market entrants. This has led to two key pieces of regulation opening up bank-held customer transaction data to third parties \cite{deloitte_2017}. With this regulation, any Third-Party Provider (TTP) can access user data with strict concerns, using it to provide consumers with innovative banking services. PSD2 defines two types of regulated TTPs: Payment Initiation Service Provider (PISP) and Account Information Service Provider (AISP). Both PISPs and AISPs must be authorized by the European Banking Authority (EBA).

![Dataflow in conventional 'Closed' banking compared to 'Open' Banking.](images/OpenBanking.png)

### Reasons for Open Banking

The financial industry has rapidly evolved from conventional banking using cash to modern software companies utilizing card payments. Open Banking aims to impact three main parties:

1. **Customers:** They have the opportunity to receive better services from both TTPs and banks while complying with strict data protections. Increased transparency allows users to make more informed decisions about the services they choose.

2. **TTPs:** PSD2 aims to make financial connections smoother between customers and financial companies. TTPs collect customers' personal and financial data from various sources, making it conveniently accessible in a single place for generating income.

3. **Banks:** While banks are impacted the most, they have the opportunity to expand their user base by connecting to other banks' systems. The initiative also promotes a more competitive market by providing customers with a greater overview of pricing and services. According to the European Commission, this was a significant reason for making this legislation, supporting both Fintechs and traditional banks.

## Used Programming Frameworks

### Angular

Angular is a TypeScript-based, free, and open-source web application framework led by the Angular Team at Google \cite{Angular}. It is used as the front end for the application, with HTML, SCSS, and TypeScript for visualizing basic pieces of information.

### .NET 5.0

.NET 5 is an open-source, server-side framework using the C# language to create dynamic webpages and applications. It is cross-platform, allowing usage on Linux, Microsoft, and Mac. For this project, .NET 5 is used to interact with an SQL-based database.

### MSSQL

MSSQL is a relational database system maintained by Microsoft. It is responsible for storing user information, login authentication, and other useful persistent data.

### ELK Stack

The ELK Stack consists of Elasticsearch, Logstash, and Kibana:

1. **Logstash:** Server-side data processing pipeline that ingests data from multiple sources, transforms it, and sends it to Elasticsearch \cite{a2015_elk}.
2. **Kibana:** Allows users to visualize data with charts and graphs, providing a user interface for Elasticsearch features \cite{a2015_elk}.
3. **Elasticsearch:** An open-source, distributed, RESTful, JSON-based scalable search engine that collects, stores, and processes data \cite{a2015_elk}.

## Other Technologies Used

### Docker
Docker is a software platform for fast development, testing, and deploying applications. It organizes software into containers, including everything the software requires to operate. Docker allows swift deployment and scaling of apps in any environment.

### Serilog
Serilog is a logging system designed to organize log data. Unlike other logging libraries for .NET, Serilog organizes log messages as structured data (JSON) that can be published to multiple output providers. It enhances the concept that log messages should be more than just a collection of text.

![Structure of the Serilog system.](images/serilog_structure-r-700.png)

**References:**  
- Deloitte (2017). "Open Banking - Accelerating Growth in Financial Services." Retrieved from [Deloitte](https://www2.deloitte.com/uk/en/pages/financial-services/articles/open-banking.html).
- Feng, P. (2015). "Serilog Structure." Retrieved from [SlideShare](https://www.slideshare.net/serilog/structure-of-serilog).
- Docker. (n.d.). Retrieved from [Docker](https://www.docker.com/).
- Serilog. (n.d.). Retrieved from [Serilog](https://serilog.net/).
- ELK. (2015). "Logstash, Elasticsearch, Kibana." Retrieved from [Elastic](https://www.elastic.co/what-is/elk-stack).

# Preparation

## Overview of the availability in different Banks.

The PSD2 directive determines 3 fundamental API access domains.

1. **Account information and Transaction**  
   With this API, it is possible to gain access to the users' transaction list, history, and account data as well while it registers the permission and its expiration for the statements.

2. **Payment initiation**  
   With this API, it is possible to stage a payment, confirm the available funds for the transfer, and submit the payment for processing.

3. **Confirmation of Funds**  
   With this API, it is possible to provide additional information about the balance of certain accounts, while it also creates a "funds confirmation consent" intent with an ASPSP, for agreement between the user and ASPSP. This consent contains the expiration date and the customer.

Although the PSD2 directive became official in 2019, many banks failed to implement some if not all of the connections the EU prescribed. It is because although this kind of pieces of information can be beneficial for the banks they rather prefer to stay in a closed system and they try to baulk at as many changes as possible.

So, if I want to implement a system that relies on these infrastructures I have to know which bank provides the necessary access to their system. For this, I summarized almost all the available banks in Hungary to see if I can work with them or not. Since this research is only concluded by reading the website and the documentation, this table does not consider if that endpoint is really working or not. This information will be set forth later.

| API Lehetőségek                                | CIB  | Cetelem | Citi  | Erste | K\&H    | OTP   | MKB  | Raiffeisen | Takarék | Uni Credit | Budapest | Gránit  |
|-----------------------------------------------|------|---------|-------|-------|---------|-------|------|-------------|---------|-------------|----------|---------|
| PSD2 Account information service for corporate | ✔    | ✔       | ✔     | ✔     | ❌       | ✔     | ✔    | ✔           | ✔       | ✔           | ✔        | ✔       |
| PSD2 Account information service for retail    | ✔    | ✔       | ✔     | ✔     | ❌       | ✔     | ✔    | ✔           | ✔       | ✔           | ✔        | ✔       |
| PSD2 Confirmation of funds service for corporate| ✔    | ❌      | ✔     | ✔     | ❌       | ❌     | ✔    | ✔           | ✔       | ✔           | ✔        | ✔       |
| PSD2 Funds confirmation service for retail      | ✔    | ❌      | ✔     | ✔     | ❌       | ❌     | ✔    | ✔           | ✔       | ✔           | ✔        | ✔       |
| PSD2 Payment initiation service for corporate   | ✔    | ✔       | ❌     | ✔     | ❌       | ✔     | ✔    | ✔           | ✔       | ✔           | ✔        | ✔       |
| PSD2 Payment initiation service for retail      | ✔    | ✔       | ❌     | ✔     | ❌       | ✔     | ✔    | ✔           | ✔       | ✔           | ✔        | ✔       |
| Sandbox availability                            | ✔    | ✔       | ✔     | ✔     | ✔       | ✔     | ✔    | ✔           | ✔       | ✔           | ✔        | ✔       |

# Overview of the API-s in different banks

Moreover, this table does not consider what will happen if the Budapest Bank, the Takarék bank, and the MKB bank emerge. I will consider them as separate entities for now.

For a faster and cleaner development process, I choose 4 banks I would like to focus on. One was the OTP bank because it is the biggest bank in Hungary, and I was familiar with its products and company. The second bank is Erste bank. I choose this bank because according to the reviews of the sandbox API this company has the best documentation and most reliable API system. The third bank is the Granit bank. This bank promotes itself as a digital bank in Hungary so I thought they pay a lot of attention to their online presence. I choose Raiffeinsen as the fourth bank. It was a random choice. I tried to choose a bank which has extensive documentation and all of their API-s available.

## Introduction of APIs

However, the legislation doesn't give an explicit rule on how the banks should implement the interfaces and which technology they should use, the companies made some steps to standardize the development. This uniformity makes implementation easier. For example, many APIs use an exact JSON structure to send and receive data. This format has many benefits which make it ideal for transmitting data. One advantage is that it uses compound documents which allows servers to send related information along the necessary resources which could result in decreasing the number of necessary HTTP requests. Moreover, many of the features are optional. This characteristic gives developers the power to choose which resources to accept which can increase optimization while reducing redundancy. Furthermore, JSON uses caching which is perfect for improving the retrieval of the data, since clients use JSON API the same way to access data, they don’t need to store it in various locations.

### Structure of the account information and transaction API

In order to acquire the users' information, AISPs are required to go through a 4 step process.

1. **Request Account Information**
   During this step, the user gives permission to the AISP to access their data.

2. **Setup Account Access Consent**
   During this step, the AISP connects to the ASPSP's endpoint in order to access its customer's data. The name of the endpoint has to be `account-access-consent` and has to be communicated with a POST request. This message can contain 3 important fields.
   - Permission: The collection of data has been permitted to access.
   - Expiration Date: Is a date range which specifies the period the data can be accessed.
   - Transaction Validity Period: Is a date range which specifies the duration of the transaction history the AISP can access.

3. **Authorize Consent**
   During this step, the user has to authorize the consent for the request. This can be done by a redirection flow where the AISP redirects the user to the ASPSP's site, or it can be done by a decoupled flow, where the user has an authentication device which is used to authorize the access. This device is a separate device from the one the user interacts with AISP.

4. **Request Data**
   In this last step, the request is carried out by the two parties by a GET call on a special endpoint called `accounts`. One such response to this call can be seen below.

```json
{
  "accounts": [
    {
      "resourceId": "string",
      "iban": "string",
      "currency": "string",
      "name": "string",
      "product": "string",
      "cashAccountType": "string",
      "balances": [
        {
          "balanceAmount": {
            "currency": "string",
            "amount": "string"
          },
          "balanceType": "string"
        }
      ],
      "_links": {
        "balances": "string",
        "transactions": "string"
      }
    }
  ]
}
```


## Structure of the payment initiation API

As mentioned above, this API grants access to the PISP to initiate a payment. In order to do that, it has to go through a 6-step process. While the first 4 steps are the same as before, only the endpoint name changes to `payment-order`. I will describe the last 2 steps.

1. **Create Payment-Order**  
   In this step, the PISP creates a payment order which will be submitted for processing. This call will be done by a POST request.

2. **Get Consent/Payment-Order/Payment-Details Status**  
   This is an optional step where the PISP can check a payment order's status with a GET request.

```json
{
  "endToEndIdentification": "IdString1234",
  "debtorAccount": {
    "iban": "BE12123412341234",
    "currency": "EUR"
  },
  "instructedAmount": {
    "currency": "EUR",
    "amount": "BE12123412341234"
  },
  "creditorAccount": {
    "iban": "BE12123412341234",
    "currency": "EUR"
  },
  "creditorAgent": "KREDBEBB",
  "creditorName": "John Doe",
  "creditorAddress": {
    "street": "string",
    "buildingNumber": "string",
    "city": "string",
    "postalCode": "string",
    "country": "BE"
  },
  "purposeCode": "BKDF",
  "remittanceInformationUnstructured": "Ref Number Merchant",
  "remittanceInformationStructured": {
    "reference": "string",
    "referenceType": "string",
    "referenceIssuer": "string"
  },
  "requestedExecutionDate": {}
}
```