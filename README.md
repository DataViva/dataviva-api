# dataviva-api


## Quickstart

This is how the API url looks like:

```
staging.dataviva.info/<dataset>/<dimension>/<another_dimension>/.../?<filters>
```


#### Dataset

The dataset are the data available. Each dataset is represented by a model. You can see all datasets that are available [here](https://github.com/DataViva/dataviva-api/tree/master/app/models).


#### Dimensions

The dimensions are the fields where the data can be grouped. The dimensions are specificy for each dataset. You can see wich dimensions are avaliable in the respective [model](https://github.com/DataViva/dataviva-api/tree/master/app/models).


#### Values

Each model has a list of values that are returned by default. But you can specify what values you want using the parameter `value`.

```
http://api.staging.dataviva.info/rais/year?value=age&value=jobs
```

#### Values

Each model also has a list of values that are result of aggregate functions. You can use it as a value.

```
http://api.staging.dataviva.info/rais/year?value=age&value=jobs
```


#### Filters

You can filter for any dimension available. For this, use the name of the dimension as key in the parameters list.

```
http://api.staging.dataviva.info/rais/year?year=2014&state=31
```


#### Limit

You can set a limit for your data. For this, use the parameter `limit`.


```
http://api.staging.dataviva.info/rais/year?limit=1
```


#### Order

You can sort your response too. For this, use the parameter `order`.


```
http://api.staging.dataviva.info/rais/year?order=year
```

and define the sort direction with the parameter `direction`.


```
http://api.staging.dataviva.info/rais/year?sort=year&direction=asc
```