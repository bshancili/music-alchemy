from openai import OpenAI

api_key = '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'
client=OpenAI(api_key=api_key)

prompt="whatever I wanna have"
response = client.images.generate(
    prompt=prompt,
    n=1,
    size="1024x1024"
)

image_url = response.data[0].url